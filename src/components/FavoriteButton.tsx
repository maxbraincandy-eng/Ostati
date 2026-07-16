"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FavoriteButton({
  masterId,
  initialFavorited,
  signedIn,
}: {
  masterId: string;
  initialFavorited: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [fav, setFav] = useState(initialFavorited);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!signedIn) {
      router.push("/login");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/favorites", {
      method: fav ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterId }),
    });
    if (res.ok) setFav(!fav);
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`btn-ghost !px-4 ${fav ? "!border-gold/60 !text-gold-light" : ""}`}
      aria-pressed={fav}
    >
      {fav ? "★ შენახულია" : "☆ შენახვა"}
    </button>
  );
}
