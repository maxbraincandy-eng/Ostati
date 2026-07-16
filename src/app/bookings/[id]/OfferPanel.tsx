"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type OfferView = {
  id: string;
  price: number;
  message: string;
  status: string;
  masterName: string;
  masterProfileId: string;
};

export default function OfferPanel({
  bookingId,
  bookingStatus,
  isCustomer,
  canOffer,
  myOffer,
  offers,
}: {
  bookingId: string;
  bookingStatus: string;
  isCustomer: boolean;
  canOffer: boolean;
  myOffer: { price: number; message: string; status: string } | null;
  offers: OfferView[];
}) {
  const router = useRouter();
  const [price, setPrice] = useState(myOffer?.price ?? 50);
  const [message, setMessage] = useState(myOffer?.message ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendOffer(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, price, message }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "შეთავაზება ვერ გაიგზავნა");
      return;
    }
    router.refresh();
  }

  async function decide(offerId: string, action: "accept" | "decline") {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/offers/${offerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "ვერ შესრულდა");
      return;
    }
    router.refresh();
  }

  const showList = isCustomer && offers.length > 0;
  if (!showList && !canOffer) return null;

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-lg font-semibold">შეთავაზებები</h2>

      {showList && (
        <ul className="space-y-4">
          {offers.map((o) => (
            <li key={o.id} className="rounded-xl border border-graphite-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/masters/${o.masterProfileId}`} className="font-medium hover:text-gold-light">
                  {o.masterName}
                </Link>
                <span className="text-lg font-bold text-gold-light">{o.price}₾</span>
              </div>
              {o.message && <p className="mt-2 text-sm text-muted">{o.message}</p>}
              {bookingStatus === "PENDING" && o.status === "PENDING" ? (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => decide(o.id, "accept")} disabled={busy} className="btn-gold flex-1 !py-2">
                    მიღება
                  </button>
                  <button onClick={() => decide(o.id, "decline")} disabled={busy} className="btn-ghost flex-1 !py-2">
                    უარყოფა
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted">
                  {o.status === "ACCEPTED" ? "✓ მიღებული" : o.status === "DECLINED" ? "✗ უარყოფილი" : ""}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      {isCustomer && offers.length === 0 && (
        <p className="text-sm text-muted">შეთავაზებები ჯერ არ არის — ოსტატები მალე გიპასუხებენ.</p>
      )}

      {canOffer && (
        <form onSubmit={sendOffer} className="mt-2 space-y-3">
          {myOffer && (
            <p className="rounded-lg bg-graphite p-3 text-xs text-muted">
              შენი შეთავაზება: {myOffer.price}₾ ({myOffer.status === "PENDING" ? "მოლოდინში" : myOffer.status}) — შეგიძლია განაახლო.
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-[140px,1fr]">
            <div>
              <label className="label">ფასი (₾)</label>
              <input type="number" min={1} required className="input" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">კომენტარი</label>
              <input className="input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="ვადა, დეტალები…" />
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-gold w-full">
            {myOffer ? "შეთავაზების განახლება" : "შეთავაზების გაგზავნა"}
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
