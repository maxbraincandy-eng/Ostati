/** Initials avatar with a stable per-name hue — no external image hosts needed. */
export default function Avatar({
  name,
  size = 44,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  return (
    <span
      className={`grid shrink-0 select-none place-items-center rounded-full font-semibold text-white ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${hash} 45% 38%), hsl(${(hash + 40) % 360} 45% 26%))`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
