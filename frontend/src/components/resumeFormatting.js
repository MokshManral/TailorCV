
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
    !BULLET_PREFIX.test(line)
  );
}

export function formatResumeText(text) {
  if (!text || typeof text !== "string") {
    return [];
  }

  const lines = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map(cleanLine);

  const blocks = [];
  let firstContentSeen = false;
  let hasName = false;

  for (const line of lines) {
    // Handle blank lines
    if (!line) {
      if (
        blocks.length > 0 &&
        blocks[blocks.length - 1].type !== "spacer"
      ) {
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

    // Identify additional contact information
    if (
      hasName &&
      CONTACT_DETAIL.test(line) &&
      !blocks.some((block) => block.type === "contact")
    ) {
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

    // Handle regular text
    blocks.push({
      type: "text",
      text: line,
    });
  }

  // Remove unnecessary trailing spacers
  while (
    blocks.length > 0 &&
    blocks[blocks.length - 1].type === "spacer"
  ) {
    blocks.pop();
  }

  return blocks;
}
