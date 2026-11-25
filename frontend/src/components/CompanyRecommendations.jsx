import { stagger } from "../lib/motion.jsx";

// LinkedIn job search for a role at a company. A search link (not a claim
// that the company is hiring) so the user sees real, current openings.
function jobSearchUrl(company, role) {
  const keywords = [role, company].filter(Boolean).join(" ");
  return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}`;
}

// "Tata Consultancy Services" -> "TC"
function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

// Soft badge colours, cycled through the list so neighbours differ.
const BADGE_COLORS = [
  "bg-sky-500/10 text-sky-600",
  "bg-emerald-500/10 text-emerald-600",
  "bg-violet-500/10 text-violet-600",
  "bg-amber-500/10 text-amber-600",
  "bg-rose-500/10 text-rose-600",
  "bg-teal-500/10 text-teal-600",
];

function ExternalIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M4.5 2.5h5v5M9.5 2.5 3 9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CompanyRecommendations({ companies = [], dark }) {
  if (companies.length === 0) return null;

  const muted = dark ? "text-neutral-400" : "text-neutral-600";
  const subtle = dark ? "text-neutral-500" : "text-neutral-500";
  const divider = dark ? "divide-neutral-800" : "divide-neutral-200";
  const chip = dark
    ? "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white"
    : "border-neutral-200 text-neutral-700 hover:border-neutral-400 hover:text-neutral-950";

  return (
    <div
      className={`rounded-2xl border p-6 transition-colors duration-300 sm:p-7 ${
        dark ? "border-neutral-800 bg-[#0e0e0e]" : "border-neutral-200 bg-white"
      }`}
    >
      {/* Header */}
      <div className="flex items-baseline justify-between gap-4">
        <h3
          className={`text-base font-semibold tracking-tight ${
            dark ? "text-white" : "text-neutral-950"
          }`}
        >
          Companies to consider
        </h3>
        <span className={`font-mono text-xs ${subtle}`}>
          {companies.length} suggestions
        </span>
      </div>

      <p className={`mt-1 text-xs ${subtle}`}>
        Based on your resume, across the roles your skills fit.
      </p>

      {/* List */}
      <ul className={`mt-4 divide-y ${divider}`}>
        {companies.map((company, index) => (
          <li
            key={company.name}
            style={stagger(index, 80, 150)}
            className="flex animate-fade-up gap-4 py-4 first:pt-2 last:pb-0"
          >
            {/* Initials badge */}
            <span
              aria-hidden="true"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${BADGE_COLORS[index % BADGE_COLORS.length]}`}
            >
              {initials(company.name)}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="pt-0.5 text-sm font-semibold leading-5">
                  {company.name}
                </p>

                <a
                  href={jobSearchUrl(company.name, company.roles?.[0])}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Search jobs at ${company.name} on LinkedIn`}
                  className={`btn-motion inline-flex shrink-0 items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium ${chip}`}
                >
                  Jobs
                  <ExternalIcon />
                </a>
              </div>

              {company.reason && (
                <p className={`mt-1 text-sm leading-6 ${muted}`}>
                  {company.reason}
                </p>
              )}

              {company.roles?.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {company.roles.map((role) => (
                    <a
                      key={role}
                      href={jobSearchUrl(company.name, role)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Search "${role}" at ${company.name} on LinkedIn`}
                      className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${chip}`}
                    >
                      {role}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Footnote */}
      <p
        className={`mt-5 border-t pt-4 text-xs leading-5 ${subtle} ${
          dark ? "border-neutral-800" : "border-neutral-200"
        }`}
      >
        AI suggestions based on your skills and experience, not live openings.
        Click a role or Jobs to search current listings on LinkedIn.
      </p>
    </div>
  );
}
