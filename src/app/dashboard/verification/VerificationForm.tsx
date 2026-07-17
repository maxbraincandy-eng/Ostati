"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const MAX_DOCS = 5;
const MAX_DOC_BYTES = 500_000;

export default function VerificationForm() {
  const router = useRouter();
  const [idNumber, setIdNumber] = useState("");
  const [experienceInfo, setExperienceInfo] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function addDocs(files: FileList | null) {
    if (!files) return;
    setError("");
    const next = [...documents];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_DOCS) break;
      if (file.size > MAX_DOC_BYTES) {
        setError("ფაილი არ უნდა აღემატებოდეს 500KB-ს");
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
    setDocuments(next);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idNumber, experienceInfo, documents }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "ვერ გაიგზავნა");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
      <div>
        <label className="label">პირადი ნომერი</label>
        <input required minLength={5} className="input" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="01001012345" />
      </div>
      <div>
        <label className="label">გამოცდილების ინფორმაცია</label>
        <textarea
          rows={3}
          className="input"
          value={experienceInfo}
          onChange={(e) => setExperienceInfo(e.target.value)}
          placeholder="სად გიმუშავია, რა პროექტები გაქვს შესრულებული, სერტიფიკატები…"
        />
      </div>
      <div>
        <label className="label">დოკუმენტები — პირადობა, სერტიფიკატები (მაქს. {MAX_DOCS}, თითო ≤500KB)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => addDocs(e.target.files)}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-graphite file:px-4 file:py-2 file:text-sm file:text-white"
        />
        {documents.length > 0 && (
          <div className="mt-3 flex gap-2">
            {documents.map((d, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d} alt={`დოკუმენტი ${i + 1}`} className="h-16 w-16 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => setDocuments(documents.filter((_, j) => j !== i))}
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
      <button type="submit" disabled={busy || documents.length === 0} className="btn-gold w-full">
        {busy ? "იგზავნება…" : "ვერიფიკაციაზე გაგზავნა"}
      </button>
    </form>
  );
}
