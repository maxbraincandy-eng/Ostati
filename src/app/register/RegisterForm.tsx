"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { CATEGORIES, CITIES } from "@/lib/constants";

export default function RegisterForm({ initialRole }: { initialRole: "CUSTOMER" | "MASTER" }) {
  const router = useRouter();
  const [role, setRole] = useState<"CUSTOMER" | "MASTER">(initialRole);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    category: CATEGORIES[0].slug as string,
    city: CITIES[0] as string,
    experienceYears: 1,
    priceFrom: 30,
    priceTo: 100,
    bio: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "რეგისტრაცია ვერ მოხერხდა");
      setBusy(false);
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push(role === "MASTER" ? "/dashboard" : "/profile");
    router.refresh();
  }

  return (
    <div className="card mt-8 p-6">
      {/* Role switch */}
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-graphite p-1">
        {(
          [
            ["CUSTOMER", "მომხმარებელი"],
            ["MASTER", "ოსტატი"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              role === value ? "bg-gold text-ink" : "text-muted hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">სახელი და გვარი</label>
          <input required className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="გიორგი მაისურაძე" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">ელფოსტა</label>
            <input required type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">ტელეფონი</label>
            <input required className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+995 5XX XX XX XX" />
          </div>
        </div>
        <div>
          <label className="label">პაროლი</label>
          <input required type="password" minLength={8} className="input" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="მინ. 8 სიმბოლო" />
        </div>

        {role === "MASTER" && (
          <div className="space-y-4 rounded-xl border border-gold/20 bg-gold/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gold-light">ოსტატის პროფილი</p>
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
            <div>
              <label className="label">შენს შესახებ</label>
              <textarea rows={3} className="input" value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="გამოცდილება, სპეციალიზაცია, რით გამოირჩევი…" />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={busy} className="btn-gold w-full">
          {busy ? "იტვირთება…" : role === "MASTER" ? "დარეგისტრირდი ოსტატად" : "რეგისტრაცია"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        უკვე გაქვს ანგარიში?{" "}
        <Link href="/login" className="text-gold-light hover:underline">შესვლა</Link>
      </p>
    </div>
  );
}
