"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type VerificationView = {
  id: string;
  masterName: string;
  masterProfileId: string;
  idNumber: string;
  experienceInfo: string;
  documents: string[];
  createdAt: string;
};

export default function AdminVerifications({ requests }: { requests: VerificationView[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function decide(id: string, action: "approve" | "reject") {
    const note = action === "reject" ? prompt("უარყოფის მიზეზი (გაეგზავნება ოსტატს):") ?? "" : "";
    setBusy(true);
    await fetch(`/api/admin/verifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    setBusy(false);
    router.refresh();
  }

  if (requests.length === 0) {
    return <div className="card p-6 text-sm text-muted">განსახილველი მოთხოვნები არ არის.</div>;
  }

  return (
    <div className="space-y-4">
      {requests.map((r) => (
        <div key={r.id} className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <a href={`/masters/${r.masterProfileId}`} className="font-semibold hover:text-gold-light">
                {r.masterName}
              </a>
              <p className="text-xs text-muted">
                პირადი №: {r.idNumber} · {r.createdAt}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => decide(r.id, "approve")} disabled={busy} className="btn-gold !px-4 !py-2">
                დადასტურება
              </button>
              <button onClick={() => decide(r.id, "reject")} disabled={busy} className="btn-ghost !border-red-500/40 !px-4 !py-2 text-red-300">
                უარყოფა
              </button>
            </div>
          </div>
          {r.experienceInfo && <p className="mt-3 text-sm text-white/85">{r.experienceInfo}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {r.documents.map((d, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={d}
                alt={`დოკუმენტი ${i + 1}`}
                onClick={() => setPreview(d)}
                className="h-20 w-20 cursor-zoom-in rounded-lg border border-graphite-border object-cover"
              />
            ))}
          </div>
        </div>
      ))}
      {preview && (
        <div
          className="fixed inset-0 z-50 grid cursor-zoom-out place-items-center bg-black/80 p-6"
          onClick={() => setPreview(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="დოკუმენტი" className="max-h-full max-w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}
