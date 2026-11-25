"""Render structured resume blocks to a one-page LaTeX resume and compile it.

The frontend parses the tailored resume into blocks for its preview:

- name      the candidate's name
- contact   header line under the name; items separated by " | "
            (emails and URLs become links, e.g. github.com/x -> "GitHub")
- section   section heading (EDUCATION, PROJECTS, ...)
- entry     entry heading: bold ``text`` on the left, ``right`` on the right
- subentry  line under an entry: ``text`` left, ``right`` right; italic when
            there is no right side (e.g. a project's tech stack)
- bullet    bullet point
- text      paragraph; optional bold ``label`` prefix (e.g. "Databases:")
- spacer    blank line (ignored)

The same blocks are sent here so the LaTeX source and compiled PDF follow the
preview. The layout reproduces the TailorCV resume template (navy uppercase
headings with a rule, bold entries with right-aligned details). If the result
runs past one page, progressively tighter spacing is tried until it fits.

Only escaped plain text from the blocks is ever placed into the template, so
users cannot inject arbitrary LaTeX commands.
"""

import os
import re
import shutil
import subprocess
import tempfile
import unicodedata
from dataclasses import dataclass

PDFLATEX_TIMEOUT_SECONDS = 30


class LatexError(Exception):
    """Raised when the resume cannot be compiled to PDF."""


@dataclass(frozen=True)
class Layout:
    """Spacing profile. The first is the template as designed; later ones are
    tighter and are only used when the resume would run past one page."""

    top_bottom: str  # top/bottom page margin
    left_right: str  # left/right page margin
    body_size: str  # extra size command for the body ("" or \small)
    item_sep: str  # space between bullets
    section_before: str  # space above section headings
    section_after: str  # space below the section rule
    entry_gap: str  # space between consecutive entries


LAYOUTS = [
    Layout("0.45in", "0.60in", "", "1pt", "9pt", "5pt", "5pt"),
    Layout("0.40in", "0.55in", "", "0.5pt", "7pt", "4pt", "4pt"),
    Layout("0.35in", "0.50in", "", "0pt", "5pt", "3pt", "3pt"),
    Layout("0.30in", "0.45in", r"\small", "0pt", "4pt", "2pt", "2pt"),
]


_PREAMBLE = r"""\documentclass[10pt,a4paper]{{article}}
\usepackage[T1]{{fontenc}}
\usepackage[utf8]{{inputenc}}
\usepackage{{lmodern}}
\usepackage{{microtype}}
\usepackage{{xcolor}}
\usepackage{{enumitem}}
\usepackage[hidelinks]{{hyperref}}
\usepackage[top={top_bottom},bottom={top_bottom},left={left_right},right={left_right}]{{geometry}}
\definecolor{{navy}}{{HTML}}{{172554}}
\definecolor{{bodycolor}}{{HTML}}{{222222}}
\pagestyle{{empty}}
\setlength{{\parindent}}{{0pt}}
\setlength{{\parskip}}{{0pt}}
\setlength{{\emergencystretch}}{{2em}}
\setlist[itemize]{{leftmargin=16pt,itemsep={item_sep},topsep=1pt,parsep=0pt,partopsep=0pt}}

% Section heading: bold navy uppercase title with a navy rule underneath
% (same look as titlesec's \titleformat with \titlerule).
\newcommand{{\resumesection}}[1]{{%
  \par\vspace{{{section_before}}}%
  {{\large\bfseries\color{{navy}}\MakeUppercase{{#1}}\par}}%
  \vspace{{2.5pt}}{{\color{{navy}}\hrule height 0.4pt}}\vspace{{{section_after}}}}}

% Separator between contact items: the line may break here, and the "|" is
% dropped when it does, so a long header wraps cleanly.
\newcommand{{\contactsep}}{{\discretionary{{}}{{}}{{\kern0.6em|\kern0.6em}}}}

% Row with #1 on the left and #2 right-aligned on the first line.
% The right side never wraps; the left side wraps in the remaining width.
% A right side wider than half the line goes on its own line instead.
\newsavebox{{\rightbox}}
\newcommand{{\resumerow}}[2]{{%
  \par\noindent\sbox{{\rightbox}}{{#2}}%
  \ifdim\wd\rightbox>0.5\linewidth
    #1\par\noindent\hfill\usebox{{\rightbox}}\par
  \else
    \begin{{minipage}}[t]{{\dimexpr\linewidth-\wd\rightbox-1.5em\relax}}%
      \raggedright #1\strut
    \end{{minipage}}\hfill\usebox{{\rightbox}}\par
    % Keep normal line spacing after a multi-line left side.
    \prevdepth=\dp\strutbox
  \fi}}

% ---------- DOCUMENT ----------
\begin{{document}}
\color{{bodycolor}}
{body_size}
"""

_LATEX_SPECIALS = {
    "\\": r"\textbackslash{}",
    "{": r"\{",
    "}": r"\}",
    "$": r"\$",
    "&": r"\&",
    "#": r"\#",
    "%": r"\%",
    "_": r"\_",
    "~": r"\textasciitilde{}",
    "^": r"\textasciicircum{}",
    "|": r"\textbar{}",
    "<": r"\textless{}",
    ">": r"\textgreater{}",
}

# Common characters pdflatex's utf8 input does not handle out of the box.
_UNICODE_REPLACEMENTS = {
    "•": "-",
    "▪": "-",
    "◦": "-",
    "‣": "-",
    "→": "->",
    "←": "<-",
    "✓": "",
    "✔": "",
    " ": " ",
    "​": "",
}

_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
_URL = re.compile(
    r"^(?:https?://|www\.|(?:[\w-]+\.)+[a-z]{2,}/\S*$|(?:[\w-]+\.)*(?:linkedin|github|gitlab|leetcode)\.com\b)",
    re.I,
)
_SEPARATOR = re.compile(r"\s+[|•·]\s+")


# Link text for well-known profile sites. The PDF shows the label; the full
# URL stays in the \href target, so it is readable in the .tex source.
_SITE_LABELS = {
    "github.com": "GitHub",
    "gitlab.com": "GitLab",
    "linkedin.com": "LinkedIn",
    "leetcode.com": "LeetCode",
    "geeksforgeeks.org": "GeeksforGeeks",
    "codeforces.com": "Codeforces",
    "codechef.com": "CodeChef",
    "hackerrank.com": "HackerRank",
    "kaggle.com": "Kaggle",
    "medium.com": "Medium",
    "behance.net": "Behance",
    "dribbble.com": "Dribbble",
}

_SEP_LATEX = r" \quad | \quad "


def _normalize_unicode(value: str) -> str:
    """Replace or drop characters pdflatex cannot typeset."""
    out = []
    for char in value:
        if char in _UNICODE_REPLACEMENTS:
            out.append(_UNICODE_REPLACEMENTS[char])
            continue
        code = ord(char)
        # Latin-1/Latin Extended-A and General Punctuation (dashes, quotes,
        # ellipsis) are supported by inputenc + T1.
        if code < 0x0180 or 0x2010 <= code <= 0x2026:
            out.append(char)
            continue
        decomposed = unicodedata.normalize("NFKD", char)
        out.append(decomposed.encode("ascii", "ignore").decode("ascii"))
    return "".join(out)


def escape_latex(value: str) -> str:
    value = _normalize_unicode(value)
    return "".join(_LATEX_SPECIALS.get(char, char) for char in value).strip()


def _short_url(url: str) -> str:
    """Readable form of a URL: no scheme, no "www.", no trailing slash."""
    return re.sub(r"^(?:https?://)?(?:www\.)?", "", url).rstrip("/")


def _site_label(url: str) -> str | None:
    """Return "GitHub", "LinkedIn", ... for well-known profile URLs."""
    host = re.sub(r"^(?:https?://)?(?:www\.)?", "", url.lower()).split("/")[0]
    for domain, name in _SITE_LABELS.items():
        if host == domain or host.endswith("." + domain):
            return name
    return None


_BARE_DOMAIN = re.compile(r"^(?:[\w-]+\.)+[a-z]{2,}$", re.I)


def _link(item: str, url_label: str | None = None, bare_domain: bool = False) -> str:
    """Render one item; emails and URLs become \\href links.

    ``bare_domain`` also links plain domains like "janedoe.dev" (used for the
    header, where "Node.js"-style false matches don't occur).

    The PDF shows a short label: the site name for profile URLs ("GitHub"),
    otherwise ``url_label`` (e.g. "Live Demo") or the short address. The full
    URL is kept in the \\href target, so it is readable in the .tex source.
    """
    clean = _normalize_unicode(item).strip()
    display = escape_latex(item)
    if not clean or any(char in clean for char in "\\{}^ "):
        return display

    if _EMAIL.match(clean):
        target, label = "mailto:" + clean, display
    elif _URL.match(clean) or (bare_domain and _BARE_DOMAIN.match(clean)):
        target = clean if clean.lower().startswith("http") else "https://" + clean
        label = _site_label(clean) or url_label or escape_latex(_short_url(clean))
    else:
        return display

    # Inside \href only % needs escaping; # and _ are taken literally.
    return rf"\href{{{target.replace('%', chr(92) + '%')}}}{{{label}}}"


# Header separator: a line may break here, and the "|" is dropped when it does,
# so a long contact line wraps cleanly instead of ending in a dangling bar.
_SEP_HEADER = "%\n\\contactsep\n"


def _render_items(text: str, header: bool = False) -> str:
    items = [part.strip() for part in _SEPARATOR.split(text) if part.strip()]
    if header:
        return _SEP_HEADER.join(
            rf"\mbox{{{_link(item, bare_domain=True)}}}" for item in items
        )
    # Project and entry links (e.g. a demo URL) show as "Live Demo".
    return _SEP_LATEX.join(_link(item, "Live Demo") for item in items)


def build_latex(blocks: list[dict], layout: Layout = LAYOUTS[0]) -> str:
    """Build the LaTeX source for a resume from preview blocks."""
    lines = [
        _PREAMBLE.format(
            top_bottom=layout.top_bottom,
            left_right=layout.left_right,
            body_size=layout.body_size,
            item_sep=layout.item_sep,
            section_before=layout.section_before,
            section_after=layout.section_after,
        )
    ]
    bullets_open = False
    header_open = False
    header_lines = 0
    entries_in_section = 0

    def close_bullets():
        nonlocal bullets_open
        if bullets_open:
            lines.append(r"\end{itemize}")
            bullets_open = False

    def close_header():
        nonlocal header_open
        if header_open:
            lines.append(r"\end{center}")
            header_open = False

    def open_header():
        nonlocal header_open
        if not header_open:
            lines.append("% ---------- HEADER ----------")
            lines.append(r"\begin{center}")
            header_open = True

    for block in blocks:
        block_type = block.get("type")
        raw = str(block.get("text", ""))
        raw_right = str(block.get("right", ""))
        text = escape_latex(raw)
        label = escape_latex(str(block.get("label", "")))

        if block_type == "spacer" or not (text or raw_right.strip() or label):
            continue

        if block_type == "name":
            close_bullets()
            close_header()
            open_header()
            lines.append(
                r"{\fontsize{23}{26}\selectfont"
                + "\n"
                + r"\textbf{\color{navy}\MakeUppercase{"
                + text
                + r"}}}\\[5pt]"
            )
            continue

        if block_type == "contact":
            open_header()
            prefix = "\\small\n" if header_lines == 0 else ""
            if header_lines > 0:
                lines[-1] = lines[-1] + r"\\[3pt]"
            lines.append(prefix + _render_items(raw, header=True))
            header_lines += 1
            continue

        close_header()

        if block_type == "section":
            close_bullets()
            lines.append("")
            lines.append(rf"\resumesection{{{text}}}")
            entries_in_section = 0
            continue

        if block_type == "entry":
            close_bullets()
            if entries_in_section > 0:
                lines.append(rf"\vspace{{{layout.entry_gap}}}")
            entries_in_section += 1
            right = _render_items(raw_right)
            if right:
                lines.append(rf"\resumerow{{\textbf{{{text}}}}}{{{right}}}")
            else:
                lines.append(rf"\textbf{{{text}}}\par")
            continue

        if block_type == "subentry":
            close_bullets()
            if raw_right.strip():
                right = _render_items(raw_right)
                lines.append(rf"\resumerow{{{text}}}{{{right}}}")
            else:
                lines.append(rf"\textit{{{text}}}\par")
            continue

        if block_type == "bullet":
            if not bullets_open:
                lines.append(r"\begin{itemize}")
                bullets_open = True
            lines.append(r"\item " + text)
            continue

        close_bullets()
        content = rf"\textbf{{{label}:}} {text}" if label else text
        lines.append(content + r"\par")

    close_bullets()
    close_header()
    lines.append("")
    lines.append(r"\end{document}")
    return "\n".join(lines) + "\n"


def _find_pdflatex() -> str:
    configured = os.getenv("PDFLATEX_PATH")
    if configured:
        return configured
    found = shutil.which("pdflatex")
    if found:
        return found
    # Default MacTeX / BasicTeX location, often missing from PATH in IDEs.
    mac_default = "/Library/TeX/texbin/pdflatex"
    if os.path.exists(mac_default):
        return mac_default
    raise LatexError(
        "PDF generation is unavailable: pdflatex is not installed on the server."
    )


def pdflatex_available() -> bool:
    try:
        _find_pdflatex()
        return True
    except LatexError:
        return False


def compile_pdf(latex_source: str) -> tuple[bytes, int]:
    """Compile LaTeX source to PDF; return (pdf bytes, page count)."""
    pdflatex = _find_pdflatex()

    env = os.environ.copy()
    # Restrict TeX file access to the working directory; never allow shell escape.
    env["openin_any"] = "p"
    env["openout_any"] = "p"

    with tempfile.TemporaryDirectory(prefix="tailorcv-") as workdir:
        tex_path = os.path.join(workdir, "resume.tex")
        with open(tex_path, "w", encoding="utf-8") as handle:
            handle.write(latex_source)

        try:
            result = subprocess.run(
                [
                    pdflatex,
                    "-interaction=nonstopmode",
                    "-halt-on-error",
                    "-no-shell-escape",
                    "resume.tex",
                ],
                cwd=workdir,
                env=env,
                capture_output=True,
                timeout=PDFLATEX_TIMEOUT_SECONDS,
            )
        except subprocess.TimeoutExpired as exc:
            raise LatexError("PDF generation timed out.") from exc

        log = result.stdout.decode("utf-8", "replace")
        pdf_path = os.path.join(workdir, "resume.pdf")
        if result.returncode != 0 or not os.path.exists(pdf_path):
            raise LatexError(f"pdflatex failed:\n{log[-2000:]}")

        match = re.search(r"Output written on resume\.pdf \((\d+) pages?", log)
        pages = int(match.group(1)) if match else 1

        with open(pdf_path, "rb") as handle:
            return handle.read(), pages


def render_one_page(blocks: list[dict]) -> tuple[str, bytes]:
    """Compile with progressively tighter layouts until the resume fits one page.

    Returns the LaTeX source and PDF of the first layout that fits, or of the
    tightest layout if none do.
    """
    source, pdf = "", b""
    for layout in LAYOUTS:
        source = build_latex(blocks, layout)
        pdf, pages = compile_pdf(source)
        if pages <= 1:
            break
    return source, pdf


# ---------------------------------------------------------------------------
# User-supplied LaTeX resumes
# ---------------------------------------------------------------------------

MAX_LATEX_SOURCE_CHARS = 100_000

# Commands that can read or write files, run programs, or change how TeX
# parses input (which could be used to sneak the others past this check).
# pdflatex already runs with shell escape off and file access limited to its
# temp directory; this is a second layer of defense.
_FORBIDDEN_LATEX = re.compile(
    r"\\(?:input|include|includeonly|InputIfFileExists|IfFileExists|"
    r"openin|openout|read|readline|write|immediate|write18|ShellEscape|"
    r"directlua|latelua|luaexec|catcode|csname|scantokens|endlinechar|"
    r"special|pdfobj|pdffiledump|pdfximage|includegraphics|includepdf|"
    r"lstinputlisting|verbatiminput|VerbatimInput|loadgame|usetikzlibrary|"
    r"bibliography|addbibresource)(?![A-Za-z])"
    r"|\\usepackage\s*(?:\[[^\]]*\])?\s*\{[^}]*\b(?:shellesc|minted|pythontex|"
    r"luacode|bashful|write18|catchfile|filecontents|verbatim)\b",
)

_ALLOWED_INPUT = re.compile(r"\\input\s*\{\s*glyphtounicode(?:\.tex)?\s*\}")

_BEGIN_DOCUMENT = re.compile(r"\\begin\s*\{document\}")
_END_DOCUMENT = re.compile(r"\\end\s*\{document\}")


def _strip_comments(source: str) -> str:
    """Remove LaTeX comments (unescaped % to end of line)."""
    return re.sub(r"(?<!\\)%.*", "", source)


def check_latex_safe(source: str) -> None:
    """Raise LatexError if the source uses commands that are not allowed."""
    # \input{glyphtounicode} (common in resume templates) only loads a
    # standard font-mapping file from the TeX installation.
    cleaned = _ALLOWED_INPUT.sub("", _strip_comments(source))
    match = _FORBIDDEN_LATEX.search(cleaned)
    if match:
        command = match.group(0).split("{")[0].strip()
        raise LatexError(
            f"Your LaTeX uses {command}, which is not supported for security "
            "reasons. Remove it (and any images or external files) and try again."
        )


def split_latex(source: str) -> tuple[str, str, str]:
    """Split a LaTeX document into (preamble, body, ending).

    ``preamble`` ends with ``\\begin{document}``; ``ending`` starts with
    ``\\end{document}``.
    """
    begin = _BEGIN_DOCUMENT.search(source)
    # Use the last \end{document} after \begin{document}.
    ends = list(_END_DOCUMENT.finditer(source, begin.end())) if begin else []
    end = ends[-1] if ends else None
    if not begin or not end:
        raise LatexError(
            "That doesn't look like a complete LaTeX document: it needs "
            "\\begin{document} and \\end{document}."
        )
    return (
        source[: begin.end()],
        source[begin.end() : end.start()],
        source[end.start() :],
    )


def latex_error_summary(error: LatexError) -> str:
    """Extract the useful lines ("! ..." and context) from a pdflatex failure."""
    message = str(error)
    lines = message.splitlines()
    picked = []
    for index, line in enumerate(lines):
        if line.startswith("!"):
            picked.extend(lines[index : index + 4])
    summary = "\n".join(picked).strip()
    return summary[:1500] or message[-1500:]
