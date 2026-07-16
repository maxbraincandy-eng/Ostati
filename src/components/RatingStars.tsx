export default function RatingStars({
  rating,
  count,
}: {
  rating: number;
  count?: number;
}) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span aria-hidden className="tracking-tight text-gold">
        {"★".repeat(full)}
        <span className="text-graphite-border">{"★".repeat(5 - full)}</span>
      </span>
      <span className="font-medium text-white">{rating > 0 ? rating.toFixed(1) : "—"}</span>
      {count !== undefined && <span className="text-muted">({count})</span>}
    </span>
  );
}
