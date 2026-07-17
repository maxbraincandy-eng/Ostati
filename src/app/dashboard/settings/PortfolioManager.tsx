"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Item = { id: string; title: string; description: string; imageUrl: string; imageHue: number };

const MAX_PHOTO_BYTES = 500_000;

export default function PortfolioManager({ items }: { items: Item[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pickPhoto(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setError("ფოტო არ უნდა აღემატებოდეს 500KB-ს");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/master/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, imageUrl }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "ვერ დაემატა");
      return;
    }
    setTitle("");
    setDescription("");
    setImageUrl("");
    router.refresh();
  }

  async function remove(id: string) {
    setBusy(true);
    await fetch("/api/master/portfolio", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="card mt-6 p-6">
      <h2 className="text-lg font-semibold">პორტფოლიო ({items.length}/12)</h2>

      <form onSubmit={add} className="mt-4 space-y-3 rounded-xl border border-graphite-border p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">სათაური</label>
            <input required className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="მაგ: სამზარეულოს რემონტი" />
          </div>
          <div>
            <label className="label">ფოტო (≤500KB)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => pickPhoto(e.target.files)}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-graphite file:px-4 file:py-2 file:text-sm file:text-white"
            />
          </div>
        </div>
        <div>
          <label className="label">აღწერა</label>
          <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="მოკლედ რა გააკეთე" />
        </div>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="ესკიზი" className="h-20 w-20 rounded-lg object-cover" />
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={busy} className="btn-gold">
          + ნამუშევრის დამატება
        </button>
      </form>

      {items.length > 0 && (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {items.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-xl border border-graphite-border p-3">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.title} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
              ) : (
                <span
                  className="h-14 w-14 shrink-0 rounded-lg"
                  style={{ background: `linear-gradient(135deg, hsl(${p.imageHue} 35% 25%), hsl(${(p.imageHue + 30) % 360} 40% 15%))` }}
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.title}</p>
                {p.description && <p className="truncate text-xs text-muted">{p.description}</p>}
              </div>
              <button onClick={() => remove(p.id)} disabled={busy} className="text-xs text-red-400 hover:underline">
                წაშლა
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
