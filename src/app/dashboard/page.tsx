import Link from "next/link";
import { redirect } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { categoryIcon, categoryName, PLATFORM_COMMISSION } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (!session.user.masterId) redirect("/profile");
  const masterId = session.user.masterId;

  const profile = await prisma.masterProfile.findUnique({ where: { id: masterId } });
  if (!profile) redirect("/profile");

  const [openRequests, myBookings, myOffers] = await Promise.all([
    // Open requests in my category + direct requests to me, still pending
    prisma.booking.findMany({
      where: {
        status: "PENDING",
        OR: [{ masterId: null, category: profile.category }, { masterId }],
      },
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } } },
    }),
    prisma.booking.findMany({
      where: { masterId, status: { in: ["ACCEPTED", "IN_PROGRESS", "COMPLETED"] } },
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } } },
    }),
    prisma.offer.findMany({ where: { masterId }, select: { bookingId: true } }),
  ]);

  const offeredIds = new Set(myOffers.map((o) => o.bookingId));
  const active = myBookings.filter((b) => b.status !== "COMPLETED");
  const completed = myBookings.filter((b) => b.status === "COMPLETED");
  const gross = completed.reduce((sum, b) => sum + (b.price ?? 0), 0);
  const commission = Math.round(gross * PLATFORM_COMMISSION);

  const stats = [
    { label: "ახალი მოთხოვნა", value: openRequests.length },
    { label: "მიმდინარე სამუშაო", value: active.length },
    { label: "დასრულებული", value: completed.length },
    { label: "შემოსავალი (წმინდა)", value: `${gross - commission}₾` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">ოსტატის Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            {categoryIcon(profile.category)} {categoryName(profile.category)} · {profile.city}
            {profile.verified && <span className="ml-2 text-gold-light">✓ ვერიფიცირებული</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/settings" className="btn-ghost !px-4">
            ⚙️ რედაქტირება
          </Link>
          <Link href="/dashboard/verification" className="btn-ghost !px-4">
            ✓ ვერიფიკაცია
          </Link>
          <Link href="/dashboard/premium" className="btn-gold !px-4">
            ⭐ Premium
          </Link>
          <Link href={`/masters/${masterId}`} className="btn-ghost !px-4">
            საჯარო პროფილი
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-2xl font-bold text-gold-light">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted">{s.label}</p>
          </div>
        ))}
      </div>
      {gross > 0 && (
        <p className="mt-2 text-xs text-muted">
          სრული ბრუნვა {gross}₾ · Ostati საკომისიო ({Math.round(PLATFORM_COMMISSION * 100)}%): {commission}₾
        </p>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* New requests */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">ახალი მოთხოვნები</h2>
          {openRequests.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted">
              ახალი მოთხოვნები ჯერ არ არის — შეამოწმე მოგვიანებით.
            </div>
          ) : (
            <ul className="space-y-3">
              {openRequests.map((b) => (
                <li key={b.id}>
                  <Link href={`/bookings/${b.id}`} className="card block p-4 transition hover:border-gold/50">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">
                        {categoryIcon(b.category)} {categoryName(b.category)}
                        {b.masterId === masterId && (
                          <span className="ml-2 rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold-light">
                            პირდაპირ შენთვის
                          </span>
                        )}
                      </p>
                      {offeredIds.has(b.id) && (
                        <span className="text-xs text-muted">✓ შეთავაზება გაგზავნილია</span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{b.description}</p>
                    <p className="mt-2 text-xs text-muted">
                      {b.customer.name} · {b.city} · {b.preferredDate.replace("T", " · ")}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Active + completed jobs */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">ჩემი სამუშაოები</h2>
          {myBookings.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted">
              მიღებული სამუშაოები ჯერ არ გაქვს.
            </div>
          ) : (
            <ul className="space-y-3">
              {myBookings.map((b) => (
                <li key={b.id}>
                  <Link href={`/bookings/${b.id}`} className="card flex items-center gap-4 p-4 transition hover:border-gold/50">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{categoryName(b.category)}</p>
                      <p className="truncate text-sm text-muted">
                        {b.customer.name} · {b.city}
                        {b.price ? ` · ${b.price}₾` : ""}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
