"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PREMIUM_PLANS } from "@/lib/premium";

export default function PremiumPlans() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function buy(plan: string) {
    setBusy(plan);
    setError("");
    const res = await fetch("/api/premium", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "გადახდა ვერ შესრულდა");
      return;
    }
    router.refresh();
  }

  return (
    <>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {PREMIUM_PLANS.map((plan, i) => (
          <div
            key={plan.id}
            className={`card flex flex-col p-6 ${i === 1 ? "ring-1 ring-gold/50" : ""}`}
          >
            {i === 1 && (
              <span className="mb-3 self-start rounded-full bg-gradient-to-r from-gold-light to-gold-dark px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
                პოპულარული
              </span>
            )}
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            <p className="mt-2">
              <span className="text-3xl font-bold text-gold-light">{plan.price}₾</span>
              <span className="text-sm text-muted"> / თვე</span>
            </p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-white/85">
              {plan.perks.map((perk) => (
                <li key={perk} className="flex gap-2">
                  <span className="text-gold">✓</span> {perk}
                </li>
              ))}
            </ul>
            <button
              onClick={() => buy(plan.id)}
              disabled={busy !== null}
              className={`mt-6 w-full ${i === 1 ? "btn-gold" : "btn-ghost"}`}
            >
              {busy === plan.id ? "მუშავდება…" : "არჩევა"}
            </button>
          </div>
        ))}
      </div>
      {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
    </>
  );
}
