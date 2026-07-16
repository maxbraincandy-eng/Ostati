"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminMasterActions({
  masterId,
  verified,
  premium,
}: {
  masterId: string;
  verified: boolean;
  premium: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(data: Record<string, boolean>) {
    setBusy(true);
    await fetch(`/api/admin/masters/${masterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="inline-flex gap-2">
      <button
        onClick={() => patch({ verified: !verified })}
        disabled={busy}
        className="rounded-lg border border-graphite-border px-3 py-1.5 text-xs transition hover:border-emerald-400/60 hover:text-emerald-300 disabled:opacity-50"
      >
        {verified ? "ვერიფიკაციის მოხსნა" : "ვერიფიკაცია"}
      </button>
      <button
        onClick={() => patch({ premium: !premium })}
        disabled={busy}
        className="rounded-lg border border-graphite-border px-3 py-1.5 text-xs transition hover:border-gold/60 hover:text-gold-light disabled:opacity-50"
      >
        {premium ? "Premium −" : "Premium +"}
      </button>
    </div>
  );
}
