"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ComplaintForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, subject, body }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "ვერ გაიგზავნა");
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <p className="mt-3 text-xs text-emerald-300">
        ✓ საჩივარი გაიგზავნა — ადმინისტრაცია განიხილავს და გიპასუხებს შეტყობინებით.
      </p>
    );
  }

  return (
    <div className="mt-3">
      {!open ? (
        <button onClick={() => setOpen(true)} className="text-xs text-muted underline hover:text-red-300">
          პრობლემა გაქვს ამ შეკვეთასთან? საჩივრის შეტანა
        </button>
      ) : (
        <form onSubmit={submit} className="space-y-3 rounded-xl border border-red-500/30 p-4">
          <p className="text-sm font-medium text-red-300">საჩივრის შეტანა</p>
          <input
            required
            className="input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="თემა — მაგ: ოსტატი არ გამოცხადდა"
          />
          <textarea
            rows={3}
            className="input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="აღწერე დეტალურად რა მოხდა…"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-ghost !border-red-500/40 !py-2 text-red-300">
              {busy ? "იგზავნება…" : "გაგზავნა"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted hover:text-white">
              გაუქმება
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
