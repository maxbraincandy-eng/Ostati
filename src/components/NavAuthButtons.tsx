"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function NavAuthButtons({ signedIn = false }: { signedIn?: boolean }) {
  if (signedIn) {
    return (
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-lg px-2 py-1 text-sm text-muted transition hover:text-white"
      >
        გასვლა
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className="btn-ghost !px-4 !py-2">
        შესვლა
      </Link>
      <Link href="/register" className="btn-gold !px-4 !py-2">
        რეგისტრაცია
      </Link>
    </div>
  );
}
