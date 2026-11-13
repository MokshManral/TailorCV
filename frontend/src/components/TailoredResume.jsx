
import { formatResumeText } from "./resumeFormatting.js";

export default function TailoredResume({ resumeText, dark }) {
  const blocks = formatResumeText(resumeText);

  return (
    <>
      <label className="mb-4 block text-sm font-medium">
        Preview Resume
      </label>

      <div
        className={`max-h-[560px] overflow-y-auto rounded-xl border p-5 shadow-sm transition-colors duration-300 sm:p-8 ${
          dark
            ? "border-neutral-700 bg-[#fdfdfc]"
            : "border-neutral-200 bg-white"
        }`}
      >
        <article
          className="resume-document mx-auto min-h-[420px] max-w-[680px] text-[13px] leading-[1.4] text-[#222]"
        >
          {blocks.map((block, index) => {
            if (block.type === "spacer") {
              return (
                <div
                  key={index}
                  className="h-1"
                  aria-hidden="true"
                />
              );
            }

            if (block.type === "name") {
              return (
                <h2
                  key={index}
                  className="mb-1 text-center text-[24px] font-bold leading-tight tracking-tight text-[#172554]"
                >
                  {block.text}
                </h2>
              );
            }

            if (block.type === "contact") {
              return (
                <p
                  key={index}
                  className="mb-3 break-words text-center text-[11px] leading-[1.3] text-neutral-600"
                >
                  {block.text}
                </p>
              );
            }

            if (block.type === "section") {
              return (
                <h3
                  key={index}
                  className="mb-1 mt-4 border-b border-[#172554] pb-1 text-[15px] font-bold uppercase leading-[1.3] tracking-wide text-[#172554] first:mt-2"
                >
                  {block.text}
                </h3>
              );
            }

            if (block.type === "bullet") {
              return (
                <div
                  key={index}
                  className="mb-[3px] flex items-start gap-2 pl-4 leading-[1.4]"
                >
                  <span
                    className="shrink-0 text-[#172554]"
                    aria-hidden="true"
                  >
                    •
                  </span>
                  <p className="min-w-0 flex-1 break-words">
                    {block.text}
                  </p>
                </div>
              );
            }

            return (
              <p
                key={index}
                className="mb-1 break-words leading-[1.4]"
              >
                {block.text}
              </p>
            );
          })}
        </article>
      </div>
    </>
  );
}
