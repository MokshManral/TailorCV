import { useEffect, useState } from "react";
import { formatResumeText } from "./resumeFormatting.js";

// Mirrors the LaTeX template in backend/services/latex_service.py so the
// preview matches the downloaded PDF.
const SERIF =
  '"Latin Modern Roman", "Computer Modern Serif", "CMU Serif", "Times New Roman", Georgia, serif';

const URL_LIKE =
  /^(?:https?:\/\/|www\.|(?:[\w-]+\.)+[a-z]{2,}\/\S*$|(?:[\w-]+\.)*(?:linkedin|github|gitlab|leetcode)\.com\b)/i;

const SITE_LABELS = {
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
};

const BARE_DOMAIN = /^(?:[\w-]+\.)+[a-z]{2,}$/i;

// Matches _link in latex_service.py: profile URLs show the site name
// ("GitHub"), other URLs show `urlLabel` (e.g. "Live Demo") or their short
// address. The full URLs are kept in the downloadable .tex file.
function itemLabel(item, { urlLabel, bareDomain = false } = {}) {
  const isUrl = URL_LIKE.test(item) || (bareDomain && BARE_DOMAIN.test(item));
  if (!isUrl || item.includes("@")) return item;

  const short = item
    .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
    .replace(/\/+$/, "");
  const host = short.toLowerCase().split("/")[0];
  const site = Object.entries(SITE_LABELS).find(
    ([domain]) => host === domain || host.endsWith(`.${domain}`),
  );
  return site ? site[1] : (urlLabel ?? short);
}

function Items({ text, header = false }) {
  const items = text
    .split(/\s+[|•·]\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  // Each item stays on one line together with the "|" before it, so a long
  // header wraps between items, like the PDF.
  return items.map((item, index) => (
    <span key={index} className="inline-block whitespace-nowrap">
      {index > 0 && <span className={header ? "px-[0.6em]" : "px-3"}>|</span>}
      {header
        ? itemLabel(item, { bareDomain: true })
        : itemLabel(item, { urlLabel: "Live Demo" })}
    </span>
  ));
}

// Matches \resumerow in latex_service.py: the right side stays on the first
// line, and a right side wider than about half the line moves below instead.
function Row({ left, right, className = "", leftClassName = "" }) {
  const stacked = right.length > 47;

  return (
    <div
      className={`${
        stacked ? "flex flex-col" : "flex items-baseline justify-between gap-4"
      } ${className}`}
    >
      <span className={`min-w-0 break-words ${leftClassName}`}>{left}</span>
      <span className={`text-right ${stacked ? "self-end" : "shrink-0"}`}>
        <Items text={right} />
      </span>
    </div>
  );
}

export default function TailoredResume({ resumeText, dark }) {
  const blocks = formatResumeText(resumeText);
  const [copyState, setCopyState] = useState("idle");
  let headerLine = 0;

  useEffect(() => {
    if (copyState === "idle") return undefined;
    const timer = setTimeout(() => setCopyState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [copyState]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(resumeText);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-sm font-medium">Preview Resume</span>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!resumeText}
          aria-live="polite"
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
            dark
              ? "border-neutral-700 text-white hover:bg-neutral-900"
              : "border-neutral-300 text-neutral-800 hover:bg-neutral-100"
          }`}
        >
          {copyState === "copied"
            ? "Copied!"
            : copyState === "failed"
              ? "Copy failed"
              : "Copy resume"}
        </button>
      </div>

      <div
        className={`max-h-[560px] overflow-y-auto rounded-xl border p-5 shadow-sm transition-colors duration-300 sm:p-8 ${
          dark
            ? "border-neutral-700 bg-[#fdfdfc]"
            : "border-neutral-200 bg-white"
        }`}
      >
        <article
          className="resume-document mx-auto min-h-[420px] max-w-[680px] text-[12px] leading-[1.35] text-[#222]"
          style={{ fontFamily: SERIF }}
        >
          {blocks.map((block, index) => {
            if (block.type === "spacer") return null;

            if (block.type === "name") {
              return (
                <h2
                  key={index}
                  className="mb-1 text-center text-[26px] font-bold uppercase leading-tight text-[#172554]"
                >
                  {block.text}
                </h2>
              );
            }

            if (block.type === "contact") {
              const first = headerLine === 0;
              headerLine += 1;
              return (
                <p
                  key={index}
                  className={`text-center text-[11px] leading-[1.4] ${
                    first ? "" : "mt-[2px]"
                  }`}
                >
                  <Items text={block.text} header />
                </p>
              );
            }

            if (block.type === "section") {
              return (
                <h3
                  key={index}
                  className="mb-1 mt-3 border-b border-[#172554] text-[14px] font-bold uppercase leading-[1.3] text-[#172554]"
                >
                  {block.text}
                </h3>
              );
            }

            if (block.type === "entry") {
              return block.right ? (
                <Row
                  key={index}
                  left={block.text}
                  right={block.right}
                  className="mt-[6px]"
                  leftClassName="font-bold"
                />
              ) : (
                <p key={index} className="mt-[6px] break-words font-bold">
                  {block.text}
                </p>
              );
            }

            if (block.type === "subentry") {
              return block.right ? (
                <Row key={index} left={block.text} right={block.right} />
              ) : (
                <p key={index} className="break-words italic">
                  {block.text}
                </p>
              );
            }

            if (block.type === "bullet") {
              return (
                <div key={index} className="flex items-start gap-2 pl-2">
                  <span className="shrink-0" aria-hidden="true">
                    •
                  </span>
                  <p className="min-w-0 flex-1 break-words">{block.text}</p>
                </div>
              );
            }

            return (
              <p key={index} className="break-words">
                {block.label && <strong>{block.label}: </strong>}
                {block.text}
              </p>
            );
          })}
        </article>
      </div>
    </>
  );
}
