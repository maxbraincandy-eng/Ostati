"use client";

import Link from "next/link";
import { useState } from "react";
import MasterCard, { type MasterCardData } from "@/components/MasterCard";
import { categoryIcon, categoryName } from "@/lib/constants";

type Result = {
  analysis: {
    category: string;
    estimateMin: number;
    estimateMax: number;
    advice: string;
    source: string;
  };
  masters: MasterCardData[];
};

const EXAMPLES = [
  "სამზარეულოში წყალი ჟონავს",
  "როზეტი აღარ მუშაობს საძინებელში",
  "კონდიციონერი აღარ აგრილებს",
  "მინდა ბინის სრული რემონტი",
];

export default function AiAssistant() {
  const [problem, setProblem] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function analyze(text: string) {
    if (text.trim().length < 3) return;
    setBusy(true);
    setError("");
    setResult(null);
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem: text.trim() }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("ანალიზი ვერ მოხერხდა — სცადე თავიდან");
      return;
    }
    setResult(await res.json());
  }

  return (
    <div className="mt-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          analyze(problem);
        }}
        className="card p-4"
      >
        <textarea
          rows={3}
          className="input"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="აღწერე რა პრობლემა გაქვს…"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setProblem(ex);
                analyze(ex);
              }}
              className="rounded-full border border-graphite-border px-3 py-1 text-xs text-muted transition hover:border-gold/50 hover:text-gold-light"
            >
              {ex}
            </button>
          ))}
          <button type="submit" disabled={busy || problem.trim().length < 3} className="btn-gold ml-auto">
            {busy ? "ანალიზი…" : "ანალიზი"}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}

      {busy && (
        <div className="card mt-6 p-8 text-center text-muted">
          <span className="animate-pulse">Ostati AI აანალიზებს პრობლემას…</span>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-6">
          <div className="card border-gold/30 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">
                {categoryIcon(result.analysis.category)} რეკომენდებული სპეციალისტი:{" "}
                <span className="text-gold-light">{categoryName(result.analysis.category)}</span>
              </p>
              <p className="rounded-full bg-gold/10 px-3 py-1 text-sm font-semibold text-gold-light">
                ~{result.analysis.estimateMin}–{result.analysis.estimateMax}₾
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/85">{result.analysis.advice}</p>
            <Link
              href={`/bookings/new?category=${result.analysis.category}`}
              className="btn-gold mt-4 inline-flex"
            >
              შეკვეთის განთავსება
            </Link>
          </div>

          {result.masters.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">შერჩეული ოსტატები</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.masters.map((m) => (
                  <MasterCard key={m.id} master={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
