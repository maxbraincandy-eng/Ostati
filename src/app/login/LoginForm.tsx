"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
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

  return (
    <div className="card mt-8 p-6">
      <form onSubmit={submit} className="space-y-4">
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
