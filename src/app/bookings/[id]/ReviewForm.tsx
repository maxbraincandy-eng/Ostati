"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, comment }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "შეფასება ვერ გაიგზავნა");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <h2 className="text-lg font-semibold">შეაფასე ოსტატი</h2>
      <div className="flex gap-1 text-3xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={n <= rating ? "text-gold" : "text-graphite-border"}
            aria-label={`${n} ვარსკვლავი`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        className="input"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="როგორი იყო გამოცდილება?"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={busy} className="btn-gold w-full">
        შეფასების გაგზავნა
      </button>
    </form>
  );
}
