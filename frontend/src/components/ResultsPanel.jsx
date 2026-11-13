
import MatchScoreTape from "./MatchScoreTape.jsx";
import KeywordBadges from "./KeywordBadges.jsx";
import Suggestions from "./Suggestions.jsx";
import TailoredResume from "./TailoredResume.jsx";
import { formatResumeText } from "./resumeFormatting.js";

function escapeLatex(value) {
  return value.replace(/[\\{}$&#%_~^]/g, (character) => {
    const replacements = {
      "\\": "\\textbackslash{}",
      "{": "\\{",
      "}": "\\}",
      "$": "\\$",
      "&": "\\&",
      "#": "\\#",
      "%": "\\%",
      "_": "\\_",
      "~": "\\textasciitilde{}",
      "^": "\\textasciicircum{}",
    };

    return replacements[character];
  });
}

function createLatexResume(text) {
  const blocks = formatResumeText(text);
  const lines = [
    "\\documentclass[10pt,a4paper]{article}",
    "\\usepackage[T1]{fontenc}",
    "\\usepackage[utf8]{inputenc}",
    "\\usepackage{lmodern}",
    "\\usepackage{microtype}",
    "\\usepackage{xcolor}",
    "\\usepackage{titlesec}",
    "\\usepackage{enumitem}",
    "\\usepackage[hidelinks]{hyperref}",
    "\\usepackage[top=0.45in,bottom=0.45in,left=0.60in,right=0.60in]{geometry}",
    "\\definecolor{navy}{HTML}{172554}",
    "\\definecolor{bodycolor}{HTML}{222222}",
    "\\pagestyle{empty}",
    "\\setlength{\\parindent}{0pt}",
    "\\setlength{\\parskip}{0pt}",
    "\\setlength{\\emergencystretch}{2em}",
    "\\color{bodycolor}",
    "\\setlist[itemize]{leftmargin=16pt,itemsep=1pt,topsep=2pt,parsep=0pt,partopsep=0pt}",
    "\\titleformat{\\section}{\\large\\bfseries\\color{navy}}{}{0em}{\\MakeUppercase}[\\vspace{1pt}\\color{navy}\\titlerule]",
    "\\titlespacing*{\\section}{0pt}{9pt}{4pt}",
    "\\begin{document}",
  ];

  let bulletsOpen = false;
  let headerOpen = false;
  const closeBullets = () => {
    if (bulletsOpen) {
      lines.push("\\end{itemize}");
      bulletsOpen = false;
    }
  };
  const closeHeader = () => {
    if (headerOpen) {
      lines.push("\\end{center}", "\\vspace{-5pt}");
      headerOpen = false;
    }
  };

  for (const block of blocks) {
    if (block.type === "spacer") continue;

    if (block.type === "name") {
      closeBullets();
      closeHeader();
      lines.push("\\begin{center}");
      headerOpen = true;
      lines.push(`{\\fontsize{23}{26}\\selectfont\\textbf{\\color{navy}${escapeLatex(block.text)}}}\\\\[4pt]`);
      continue;
    }

    if (block.type === "contact") {
      lines.push(`\\small ${escapeLatex(block.text)}`);
      closeHeader();
      continue;
    }

    closeHeader();

    if (block.type === "section") {
      closeBullets();
      lines.push(`\\section{${escapeLatex(block.text)}}`);
      continue;
    }

    if (block.type === "bullet") {
      if (!bulletsOpen) {
        lines.push("\\begin{itemize}");
        bulletsOpen = true;
      }
      lines.push(`\\item ${escapeLatex(block.text)}`);
      continue;
    }

    closeBullets();
    lines.push(`${escapeLatex(block.text)}\\\\`);
  }

  closeBullets();
  closeHeader();
  lines.push("\\end{document}");
  return lines.join("\n");
}

function downloadLatex(text) {
  if (!text || typeof text !== "string") return;

  const source = createLatexResume(text);
  const file = new Blob([source], { type: "application/x-tex;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "TailorCV-Tailored-Resume.tex";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Skeleton
function Skeleton({ dark, className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md ${
        dark ? "bg-neutral-800" : "bg-neutral-200"
      } ${className}`}
    />
  );
}

// Loading UI
function ResultsSkeleton({ dark }) {
  const card = dark
    ? "border-neutral-800 bg-[#111]"
    : "border-neutral-200 bg-white";

  return (
    <div className="flex flex-col gap-5">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className={`rounded-2xl border p-6 ${card}`}
        >
          <Skeleton dark={dark} className="h-5 w-40" />
          <Skeleton dark={dark} className="mt-5 h-4 w-full" />
          <Skeleton dark={dark} className="mt-3 h-4 w-4/5" />
          <Skeleton dark={dark} className="mt-3 h-4 w-3/5" />
        </div>
      ))}
    </div>
  );
}

export default function ResultsPanel({
  result,
  onStartOver,
  dark,
  loading = false,
}) {
  if (loading) {
    return <ResultsSkeleton dark={dark} />;
  }

  if (!result) return null;

  const resumeText = result.tailored_resume;

  const card = dark
    ? "border-neutral-800 bg-[#111]"
    : "border-neutral-200 bg-white";

  const muted = dark
    ? "text-neutral-400"
    : "text-neutral-500";

  return (
    <div className="flex flex-col gap-8">

      {/* STEP 01 - TAILORED RESUME */}
      <section>
        <TailoredResume
          resumeText={resumeText}
          dark={dark}
        />

        {/* DOWNLOAD LATEX SOURCE */}
        <div
          className={`mt-6 border-t pt-5 ${
            dark
              ? "border-neutral-800"
              : "border-neutral-200"
          }`}
        >
          <p className={`mb-4 text-xs ${muted}`}>
            Download the editable LaTeX source for your resume.
          </p>

          <div>
            <button
              type="button"
              onClick={() => downloadLatex(resumeText)}
              disabled={!resumeText || typeof resumeText !== "string"}
              className={`flex w-full items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                dark
                  ? "border-neutral-700 text-white hover:bg-neutral-900"
                  : "border-neutral-300 text-neutral-800 hover:bg-neutral-100"
              }`}
            >
              Download Resume (.tex)
            </button>
          </div>
        </div>
        <p className="pt-2 text-xs text-neutral-500 text-red-500">
          Open the .tex file in a LaTeX editor, such as Overleaf, to customize or compile it.
        </p>
      </section>

      {/* STEP 02 - MATCH SCORE */}
      <section>
        <MatchScoreTape
          score={result.match_score}
          summary={result.summary}
          dark={dark}
        />
      </section>

      {/* STEP 03 - KEYWORDS */}
      <section>
        <div className="grid gap-5">

          <KeywordBadges
            title="Matching keywords"
            keywords={result.matched_keywords}
            variant="matched"
            emptyLabel="No strong keyword matches found."
            dark={dark}
          />

          <KeywordBadges
            title="Missing keywords"
            keywords={result.missing_keywords}
            variant="missing"
            emptyLabel="No major gaps found."
            dark={dark}
          />

        </div>
      </section>

      {/* STEP 04 - SUGGESTIONS */}
      <section>
        <Suggestions
          suggestions={result.suggestions}
          dark={dark}
        />
      </section>

      {/* BOTTOM MESSAGE */}
      <div className={`rounded-2xl border p-7 text-center ${card}`}>
        <h3 className="text-base font-semibold">
          One step closer to your next opportunity.
        </h3>

        <p className={`mt-2 text-sm leading-6 ${muted}`}>
          Use these insights to make your next application stronger.
        </p>

        <button
          type="button"
          onClick={onStartOver}
          className={`mt-6 rounded-lg border px-5 py-2.5 text-sm font-semibold transition ${
            dark
              ? "border-neutral-700 hover:bg-neutral-900"
              : "border-neutral-200 hover:bg-neutral-100"
          }`}
        >
          + Start a new analysis
        </button>
      </div>

    </div>
  );
}
