import { STATUS_LABELS } from "@/lib/constants";

const STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
  ACCEPTED: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  IN_PROGRESS: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  COMPLETED: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  CANCELLED: "bg-red-500/10 text-red-300 border-red-500/30",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        STYLES[status] ?? "bg-graphite text-muted border-graphite-border"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
