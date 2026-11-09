
import CharCount from "./CharCount";

export default function InputBox({
  title,
  name,
  value,
  onChange,
  fieldErrors = {},
  dark,
}) {
  const error = fieldErrors[name];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={name}
          className={`text-sm font-medium ${
            dark ? "text-neutral-300" : "text-neutral-700"
          }`}
        >
          {title}
        </label>

        <CharCount count={value.length} dark={dark} />
      </div>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={`Paste your ${title.toLowerCase()} text here...`}
        rows={10}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full resize-y rounded-xl border px-4 py-3.5 text-sm leading-6 outline-none transition ${
          error
            ? dark
              ? "border-red-500/60 bg-red-500/5 text-white"
              : "border-red-300 bg-red-50 text-neutral-900"
            : dark
              ? "border-neutral-800 bg-neutral-950 text-white placeholder:text-neutral-700 focus:border-neutral-600"
              : "border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
        }`}
      />

      {error && (
        <p
          id={`${name}-error`}
          role="alert"
          className={`text-sm ${
            dark ? "text-red-400" : "text-red-600"
          }`}
        >
          {error}
        </p>
      )}
    </div>
  );
}
