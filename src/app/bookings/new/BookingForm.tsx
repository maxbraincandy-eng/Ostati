"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, CITIES } from "@/lib/constants";

const MAX_PHOTOS = 4;
const MAX_PHOTO_BYTES = 500_000;

export default function BookingForm({
  masterId,
  masterName,
  initialCategory,
}: {
  masterId: string | null;
  masterName: string | null;
  initialCategory: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    category: initialCategory || (CATEGORIES[0].slug as string),
    description: "",
    address: "",
    city: CITIES[0] as string,
    preferredDate: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    setError("");
    const next = [...photos];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_PHOTOS) break;
      if (file.size > MAX_PHOTO_BYTES) {
        setError("ფოტო არ უნდა აღემატებოდეს 500KB-ს");
        continue;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      next.push(dataUrl);
    }
    setPhotos(next);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, masterId, photos }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "შეკვეთა ვერ შეიქმნა");
      setBusy(false);
      return;
    }
    router.push(`/bookings/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card mt-8 space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">მომსახურების ტიპი</label>
          <select
            className="input"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            disabled={!!masterId}
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
          {masterName && <p className="mt-1 text-xs text-muted">ოსტატი: {masterName}</p>}
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
        <label className="label">პრობლემის აღწერა</label>
        <textarea
          required
          rows={4}
          className="input"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="აღწერე დეტალურად — რა გჭირდება, რა მდგომარეობაა ახლა…"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">მისამართი</label>
          <input
            required
            className="input"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="ქუჩა, ბინა, სართული"
          />
        </div>
        <div>
          <label className="label">სასურველი დრო</label>
          <input
            required
            type="datetime-local"
            className="input"
            value={form.preferredDate}
            onChange={(e) => set("preferredDate", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="label">ფოტოები (მაქს. {MAX_PHOTOS}, თითო ≤500KB)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => addPhotos(e.target.files)}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-graphite file:px-4 file:py-2 file:text-sm file:text-white"
        />
        {photos.length > 0 && (
          <div className="mt-3 flex gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt={`ფოტო ${i + 1}`} className="h-16 w-16 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                  className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-xs text-white"
                  aria-label="წაშლა"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={busy} className="btn-gold w-full">
        {busy ? "იგზავნება…" : "შეკვეთის განთავსება"}
      </button>
    </form>
  );
}
