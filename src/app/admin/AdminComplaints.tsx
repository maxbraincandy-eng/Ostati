"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type ComplaintView = {
  id: string;
  subject: string;
  body: string;
  authorName: string;
  bookingId: string;
  status: string;
  resolution: string;
  createdAt: string;
};

export default function AdminComplaints({ complaints }: { complaints: ComplaintView[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function resolve(id: string) {
    const resolution = prompt("პასუხი / გადაწყვეტილება (გაეგზავნება ავტორს):");
    if (!resolution) return;
    setBusy(true);
    await fetch(`/api/admin/complaints/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution }),
    });
    setBusy(false);
    router.refresh();
  }

  if (complaints.length === 0) {
    return <div className="card p-6 text-sm text-muted">საჩივრები არ არის.</div>;
  }

  return (
    <div className="space-y-3">
      {complaints.map((c) => (
        <div key={c.id} className={`card p-5 ${c.status === "OPEN" ? "border-red-500/30" : ""}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{c.subject}</p>
              <p className="text-xs text-muted">
                {c.authorName} · {c.createdAt} ·{" "}
                <a href={`/bookings/${c.bookingId}`} className="text-gold-light hover:underline">
                  შეკვეთის ნახვა
                </a>
              </p>
            </div>
            {c.status === "OPEN" ? (
              <button onClick={() => resolve(c.id)} disabled={busy} className="btn-gold !px-4 !py-2">
                გადაწყვეტა
              </button>
            ) : (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-300">
                გადაწყვეტილია
              </span>
            )}
          </div>
          {c.body && <p className="mt-2 text-sm text-white/85">{c.body}</p>}
          {c.resolution && (
            <p className="mt-2 rounded-lg bg-graphite p-3 text-sm text-muted">პასუხი: {c.resolution}</p>
          )}
        </div>
      ))}
    </div>
  );
}
