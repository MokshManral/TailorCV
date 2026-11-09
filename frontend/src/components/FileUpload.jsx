import { useRef } from "react";

export default function FileUpload({
  file,
  setFile,
  dark,
}) {
  const inputRef = useRef(null);

  function handleChange(e) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    const allowedExtensions = /\.(pdf|doc|docx)$/i;

    if (!allowedExtensions.test(selectedFile.name)) {
      alert("Please upload a PDF, DOC or DOCX file.");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10 MB.");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={handleChange}
      />

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex w-full items-center gap-3 rounded-xl border border-dashed p-5 text-left transition ${
            dark
              ? "border-neutral-700 hover:border-neutral-500 hover:bg-neutral-900"
              : "border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50"
          }`}
        >
          <div
            className={`rounded-lg p-3 ${
              dark ? "bg-neutral-800" : "bg-neutral-100"
            }`}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16V4m0 0L8 8m4-4 4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"
              />
            </svg>
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium">
              Upload your resume
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              PDF or DOCX · Max 10 MB
            </p>
          </div>

          <span className="text-xs font-medium text-neutral-500">
            Browse
          </span>
        </button>
      ) : (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 ${
            dark
              ? "border-neutral-800 bg-neutral-900"
              : "border-neutral-200 bg-neutral-50"
          }`}
        >
          <div className="rounded-lg bg-blue-500/10 p-3">
            <svg
              className="h-6 w-6 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 3v5h5M9 13h6M9 17h6"
              />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {file.name}
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB · Ready to analyze
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFile(null)}
            className="rounded-md p-2 text-neutral-500 hover:bg-neutral-200 hover:text-red-500 dark:hover:bg-neutral-800"
            aria-label="Remove resume"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}