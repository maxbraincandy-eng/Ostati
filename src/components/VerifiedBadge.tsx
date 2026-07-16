export default function VerifiedBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold-light"
      title="Verified Ostati Professional"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 1l3 3 4.2.6.6 4.2 3 3-3 3-.6 4.2-4.2.6-3 3-3-3-4.2-.6-.6-4.2-3-3 3-3 .6-4.2L9 4l3-3zm-1.2 14.5l6-6-1.4-1.4-4.6 4.6-2.2-2.2-1.4 1.4 3.6 3.6z" />
      </svg>
      {compact ? "Verified" : "Verified Ostati Professional"}
    </span>
  );
}
