"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ACTIONS: Record<string, { status: string; next: string; label: string; gold?: boolean }[]> = {
  master: [
    { status: "PENDING", next: "ACCEPTED", label: "შეკვეთის მიღება", gold: true },
    { status: "ACCEPTED", next: "IN_PROGRESS", label: "სამუშაოს დაწყება", gold: true },
    { status: "IN_PROGRESS", next: "COMPLETED", label: "სამუშაოს დასრულება", gold: true },
    { status: "PENDING", next: "CANCELLED", label: "უარყოფა" },
  ],
  customer: [
    { status: "PENDING", next: "CANCELLED", label: "შეკვეთის გაუქმება" },
    { status: "ACCEPTED", next: "CANCELLED", label: "შეკვეთის გაუქმება" },
  ],
};

export default function BookingActions({
  bookingId,
  status,
  role,
}: {
  bookingId: string;
  status: string;
  role: "master" | "customer" | "viewer";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const actions = (ACTIONS[role] ?? []).filter((a) => a.status === status);
  if (actions.length === 0) return null;

  async function setStatus(next: string) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "ვერ განახლდა");
      return;
    }
    router.refresh();
  }

  return (
    <div className="card space-y-2 p-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">მოქმედებები</h2>
      {actions.map((a) => (
        <button
          key={a.next}
          onClick={() => setStatus(a.next)}
          disabled={busy}
          className={`${a.gold ? "btn-gold" : "btn-ghost"} w-full`}
        >
          {a.label}
        </button>
      ))}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
