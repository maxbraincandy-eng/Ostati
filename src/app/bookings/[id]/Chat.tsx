"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string };
};

export default function Chat({ bookingId, myUserId }: { bookingId: string; myUserId: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/messages?bookingId=${bookingId}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // lightweight polling; websockets are a Phase 2 upgrade
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, body: text.trim() }),
    });
    setBusy(false);
    if (res.ok) {
      setText("");
      load();
    }
  }

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-lg font-semibold">ჩატი</h2>
      <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-muted">მიმოწერა ჯერ არ დაწყებულა — მიწერე პირველი.</p>
        )}
        {messages.map((m) => {
          const mine = m.sender.id === myUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  mine ? "bg-gold text-ink" : "bg-graphite text-white"
                }`}
              >
                {!mine && <p className="mb-0.5 text-xs font-semibold text-gold-light">{m.sender.name}</p>}
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p className={`mt-1 text-right text-[10px] ${mine ? "text-ink/60" : "text-muted"}`}>
                  {new Date(m.createdAt).toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="mt-4 flex gap-2">
        <input
          className="input flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="შეტყობინება…"
        />
        <button type="submit" disabled={busy || !text.trim()} className="btn-gold">
          გაგზავნა
        </button>
      </form>
    </div>
  );
}
