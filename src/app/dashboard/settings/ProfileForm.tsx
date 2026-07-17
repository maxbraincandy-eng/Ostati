"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, CITIES } from "@/lib/constants";

type ProfileData = {
  category: string;
  city: string;
  bio: string;
  experienceYears: number;
  priceFrom: number;
  priceTo: number;
  workHours: string;
  phone: string;
};

export default function ProfileForm({ initial }: { initial: ProfileData }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function set<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/master/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    setMessage(res.ok ? "✓ შენახულია" : "ვერ შეინახა — შეამოწმე ველები");
    if (res.ok) router.refresh();
  }

  return (
    <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
      <h2 className="text-lg font-semibold">ძირითადი ინფორმაცია</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">პროფესია</label>
          <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">ქალაქი</label>
          <select className="input" value={form.city} onChange={(e) => set("city", e.target.value)}>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">შენს შესახებ</label>
        <textarea rows={3} className="input" value={form.bio} onChange={(e) => set("bio", e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">გამოცდილება (წელი)</label>
          <input type="number" min={0} max={60} className="input" value={form.experienceYears} onChange={(e) => set("experienceYears", Number(e.target.value))} />
        </div>
        <div>
          <label className="label">ფასი დან (₾)</label>
          <input type="number" min={0} className="input" value={form.priceFrom} onChange={(e) => set("priceFrom", Number(e.target.value))} />
        </div>
        <div>
          <label className="label">ფასი მდე (₾)</label>
          <input type="number" min={0} className="input" value={form.priceTo} onChange={(e) => set("priceTo", Number(e.target.value))} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">სამუშაო საათები</label>
          <input className="input" value={form.workHours} onChange={(e) => set("workHours", e.target.value)} placeholder="ორშ–შაბ 09:00–19:00" />
        </div>
        <div>
          <label className="label">ტელეფონი</label>
          <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={busy} className="btn-gold">
          {busy ? "ინახება…" : "შენახვა"}
        </button>
        {message && <span className="text-sm text-muted">{message}</span>}
      </div>
    </form>
  );
}
