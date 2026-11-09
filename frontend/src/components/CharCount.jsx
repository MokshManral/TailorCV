export default function CharCount({ count, dark }) {
  return (
    <span
      className={`font-mono text-xs ${
        dark ? "text-neutral-600" : "text-neutral-400"
      }`}
    >
      {count.toLocaleString()} characters
    </span>
  );
}