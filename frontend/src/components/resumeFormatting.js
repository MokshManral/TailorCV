const KNOWN_SECTION_HEADINGS = new Set([
  "SUMMARY",
  "PROFESSIONAL SUMMARY",
  "PROFILE",
  "CAREER OBJECTIVE",
  "OBJECTIVE",
  "EXPERIENCE",
  "WORK EXPERIENCE",
  "PROFESSIONAL EXPERIENCE",
  "EMPLOYMENT HISTORY",
  "EDUCATION",
  "SKILLS",
  "TECHNICAL SKILLS",
  "CORE SKILLS",
  "KEY SKILLS",
  "PROJECTS",
  "PERSONAL PROJECTS",
  "ACADEMIC PROJECTS",
  "CERTIFICATIONS",
  "ACHIEVEMENTS",
  "AWARDS",
  "RELEVANT COURSEWORK",
  "COURSEWORK",
  "VOLUNTEER EXPERIENCE",
  "PUBLICATIONS",
  "LANGUAGES",
  "INTERESTS",
  "EXTRACURRICULAR ACTIVITIES",
  "PROFESSIONAL DEVELOPMENT",
  "INTERNSHIPS",
  "REFERENCES",
]);

// "Left | Right" separator used for entry lines (e.g. "Acme Corp | 2023 – Present")
const ENTRY_SEPARATOR = /\s+\|\s+/;

// "Languages: Python, SQL" style label lines
const LABEL_LINE = /^([A-Za-z][A-Za-z0-9 &/+.-]{0,30}):\s+(.+)$/;

const BULLET_PREFIX = /^(?:[-*•▪◦‣]|\d+[.)])\s+/;

const CONTACT_DETAIL =
  /(?:\b[^\s@]+@[^\s@]+\.[^\s@]+\b|https?:\/\/|www\.|linkedin|github|\+?\d[\d\s().-]{7,}\d)/i;

// Clean markdown and unnecessary whitespace
function cleanLine(line) {
  return line
    .replace(/^\s{0,3}#{1,6}\s*/, "")
    .replace(/^\s*\*\*(.*?)\*\*\s*$/, "$1")
    .replace(/^\s*__(.*?)__\s*$/, "$1")
    .trim();
}

// Identify resume section headings
function isSectionHeading(line) {
  const normalized = line
    .replace(/[:：]$/, "")
    .replace(/[&]/g, "AND")
    .replace(/\s+/g, " ")
    .toUpperCase();

  if (KNOWN_SECTION_HEADINGS.has(normalized)) {
    return true;
  }

  return (
    line.length <= 45 &&
    line.length >= 3 &&
    /[A-Z]/.test(line) &&
    line === line.toUpperCase() &&
    !CONTACT_DETAIL.test(line) &&
    !BULLET_PREFIX.test(line) &&
    !ENTRY_SEPARATOR.test(line)
  );
}

export function formatResumeText(text) {
  if (!text || typeof text !== "string") {
    return [];
  }

  const lines = text.replace(/\r\n?/g, "\n").split("\n").map(cleanLine);

  const blocks = [];
  let firstContentSeen = false;
  let hasName = false;

  for (const line of lines) {
    // Handle blank lines
    if (!line) {
      if (blocks.length > 0 && blocks[blocks.length - 1].type !== "spacer") {
        blocks.push({
          type: "spacer",
          text: "",
        });
      }
      continue;
    }

    // Handle section headings
    if (isSectionHeading(line)) {
      blocks.push({
        type: "section",
        text: line.replace(/[:：]$/, ""),
      });

      firstContentSeen = true;
      continue;
    }

    // Identify name and initial contact details
    if (!firstContentSeen) {
      if (CONTACT_DETAIL.test(line)) {
        blocks.push({
          type: "contact",
          text: line,
        });
      } else {
        blocks.push({
          type: "name",
          text: line,
        });
        hasName = true;
      }

      firstContentSeen = true;
      continue;
    }

    // Every line between the name and the first section heading belongs to
    // the header (contact links, location).
    if (hasName && !blocks.some((block) => block.type === "section")) {
      blocks.push({
        type: "contact",
        text: line,
      });
      continue;
    }

    // Handle bullet points
    const bulletMatch = line.match(BULLET_PREFIX);

    if (bulletMatch) {
      blocks.push({
        type: "bullet",
        text: line.slice(bulletMatch[0].length),
      });
      continue;
    }

    // Handle entry lines: "Left | Right". A line directly under an entry
    // becomes its subentry (e.g. "Software Engineer | Bengaluru").
    // Split at the first separator only: "Class XII | 71% | 2023" keeps
    // "71% | 2023" together on the right.
    const separator = line.match(ENTRY_SEPARATOR);
    const parts = separator
      ? [
          line.slice(0, separator.index),
          line.slice(separator.index + separator[0].length),
        ]
      : [line];

    // Treat placeholder right sides ("N/A", "-") as empty.
    if (
      parts.length === 2 &&
      /^(?:n\/?a|none|nil|-+|–)$/i.test(parts[1].trim())
    ) {
      parts[1] = "";
    }

    if (parts.length === 2 && parts[1].length <= 80) {
      const previous = [...blocks]
        .reverse()
        .find((block) => block.type !== "spacer");

      blocks.push({
        type: previous?.type === "entry" ? "subentry" : "entry",
        text: parts[0],
        right: parts[1],
      });
      continue;
    }

    // A plain line directly under an entry heading (e.g. a project's tech
    // stack) is its italic subentry.
    const lastBlock = blocks[blocks.length - 1];
    if (lastBlock?.type === "entry" && !LABEL_LINE.test(line)) {
      blocks.push({ type: "subentry", text: line, right: "" });
      continue;
    }

    // Handle label lines: "Languages: Python, SQL"
    const labelMatch = line.match(LABEL_LINE);

    if (labelMatch && !CONTACT_DETAIL.test(labelMatch[1])) {
      blocks.push({
        type: "text",
        label: labelMatch[1],
        text: labelMatch[2],
      });
      continue;
    }

    // Handle regular text
    blocks.push({
      type: "text",
      text: line,
    });
  }

  return removeEmptySections(blocks);
}

// Lines that only say there is nothing to show ("N/A", "No experience").
const PLACEHOLDER =
  /^(?:n\/?a|none|nil|not applicable|fresher|-+|–|no(?: work| professional)? experience(?: yet)?)\.?$/i;

function isPlaceholder(block) {
  return (
    ["text", "bullet", "entry", "subentry"].includes(block.type) &&
    PLACEHOLDER.test(block.text.trim()) &&
    !block.right &&
    !block.label
  );
}

// Drop placeholder lines, then any section left with no content, so a
// resume without e.g. work experience has no empty EXPERIENCE heading.
function removeEmptySections(blocks) {
  const cleaned = blocks.filter((block) => !isPlaceholder(block));
  const result = [];

  for (let i = 0; i < cleaned.length; i += 1) {
    const block = cleaned[i];

    if (block.type === "section") {
      let hasContent = false;
      for (let j = i + 1; j < cleaned.length; j += 1) {
        if (cleaned[j].type === "section") break;
        if (cleaned[j].type !== "spacer") {
          hasContent = true;
          break;
        }
      }
      if (!hasContent) continue;
    }

    result.push(block);
  }

  // Remove unnecessary trailing spacers
  while (result.length > 0 && result[result.length - 1].type === "spacer") {
    result.pop();
  }

  return result;
}
