"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // email tab
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // phone tab
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState("");

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) {
      setError("ელფოსტა ან პაროლი არასწორია");
      return;
    }
    router.push("/profile");
    router.refresh();
  }

  async function sendCode() {
    setBusy(true);
    setError("");
    setDevCode("");
    const res = await fetch("/api/auth/phone/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "კოდი ვერ გაიგზავნა");
      return;
    }
    setCodeSent(true);
    if (data.devCode) setDevCode(data.devCode);
  }

  async function submitPhone(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await signIn("phone-otp", { phone, code, redirect: false });
    setBusy(false);
    if (res?.error) {
      setError("კოდი არასწორია ან ვადა გაუვიდა");
      return;
    }
    router.push("/profile");
    router.refresh();
  }

  return (
    <div className="card mt-8 p-6">
      {/* Method switch */}
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-graphite p-1">
        {(
          [
            ["email", "ელფოსტით"],
            ["phone", "ტელეფონით"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setTab(value);
              setError("");
            }}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              tab === value ? "bg-gold text-ink" : "text-muted hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "email" ? (
        <form onSubmit={submitEmail} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">ელფოსტა</label>
            <input
              id="email"
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">პაროლი</label>
            <input
              id="password"
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={busy} className="btn-gold w-full">
            {busy ? "იტვირთება…" : "შესვლა"}
          </button>
        </form>
      ) : (
        <form onSubmit={submitPhone} className="space-y-4">
          <div>
            <label className="label" htmlFor="phone">ტელეფონის ნომერი</label>
            <div className="flex gap-2">
              <input
                id="phone"
                type="tel"
                required
                className="input flex-1"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="5XX XX XX XX"
                disabled={codeSent}
              />
              <button
                type="button"
                onClick={sendCode}
                disabled={busy || phone.replace(/\D/g, "").length < 9}
                className="btn-ghost shrink-0 !px-4"
              >
                {codeSent ? "თავიდან" : "კოდი"}
              </button>
            </div>
          </div>
          {codeSent && (
            <div>
              <label className="label" htmlFor="code">SMS კოდი</label>
              <input
                id="code"
                inputMode="numeric"
                required
                minLength={6}
                maxLength={6}
                className="input text-center text-lg tracking-[0.5em]"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
              />
              {devCode && (
                <p className="mt-2 rounded-lg bg-gold/10 p-2 text-center text-xs text-gold-light">
                  დემო რეჟიმი (SMS პროვაიდერი არ არის მიბმული) — კოდი: <strong>{devCode}</strong>
                </p>
              )}
            </div>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={busy || !codeSent || code.length !== 6} className="btn-gold w-full">
            {busy ? "იტვირთება…" : "შესვლა კოდით"}
          </button>
        </form>
      )}

      {googleEnabled && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-graphite-border" /> ან <span className="h-px flex-1 bg-graphite-border" />
          </div>
          <button onClick={() => signIn("google", { callbackUrl: "/profile" })} className="btn-ghost w-full">
            Google-ით შესვლა
          </button>
        </>
      )}
      <p className="mt-6 text-center text-sm text-muted">
        არ გაქვს ანგარიში?{" "}
        <Link href="/register" className="text-gold-light hover:underline">
          რეგისტრაცია
        </Link>
      </p>
      <p className="mt-4 rounded-lg bg-graphite p-3 text-center text-xs text-muted">
        დემო ანგარიშები: <code>demo@ostati.ge</code> (მომხმარებელი), <code>master@ostati.ge</code>{" "}
        (ოსტატი), <code>admin@ostati.ge</code> (ადმინი) — პაროლი ყველგან <code>ostati123</code>
      </p>
    </div>
  );
}
