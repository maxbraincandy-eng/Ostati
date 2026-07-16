import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "შეტყობინებები" };

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Viewing the page marks everything as read.
  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">შეტყობინებები</h1>
      {notifications.length === 0 ? (
        <div className="card mt-8 p-10 text-center text-sm text-muted">შეტყობინებები არ გაქვს.</div>
      ) : (
        <ul className="mt-8 space-y-2">
          {notifications.map((n) => {
            const inner = (
              <div className={`card p-4 ${!n.read ? "border-gold/40" : ""} ${n.href ? "transition hover:border-gold/50" : ""}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{n.title}</p>
                  <span className="shrink-0 text-xs text-muted">
                    {n.createdAt.toLocaleString("ka-GE", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
                {n.body && <p className="mt-1 text-sm text-muted">{n.body}</p>}
              </div>
            );
            return (
              <li key={n.id}>{n.href ? <Link href={n.href}>{inner}</Link> : inner}</li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
