export default function TailoredResume({ resumeText, dark }) {
  return (
    <>
      <label className="mb-4 block text-sm font-medium">
        Preview Resume
      </label>

      <div className="transition-colors duration-300">
        <div
          className={`max-h-[400px] overflow-y-auto rounded-xl p-5 text-sm leading-relaxed ${
            dark
              ? "bg-black text-neutral-300"
              : "bg-[#fafafa] text-neutral-700"
          }`}
        >
          <pre className="whitespace-pre-wrap break-words font-body">
            {resumeText}
          </pre>
        </div>
      </div>
    </>
  );
}
