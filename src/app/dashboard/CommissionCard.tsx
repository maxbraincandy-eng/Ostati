"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CommissionCard({ due }: { due: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/commissions/pay", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      setError(data.error ?? "ვერ შესრულდა");
      return;
    }
    if (data.redirect) {
      window.location.href = data.redirect;
      return;
    }
    setBusy(false);
    router.refresh();
  }

  if (due <= 0) return null;

  return (
    <div className="card mt-6 flex flex-wrap items-center justify-between gap-4 border-gold/30 p-5">
      <div>
        <p className="font-semibold">
          Ostati საკომისიო: <span className="text-gold-light">{due}₾</span>
        </p>
        <p className="mt-0.5 text-xs text-muted">
          დარიცხულია დასრულებულ სამუშაოებზე (8%). გადაიხადე, რომ პროფილი აქტიური დარჩეს.
        </p>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
      <button onClick={pay} disabled={busy} className="btn-gold">
        {busy ? "მუშავდება…" : "გადახდა"}
      </button>
    </div>
  );
}
