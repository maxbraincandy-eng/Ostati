import Link from "next/link";
import { redirect } from "next/navigation";
import Avatar from "@/components/Avatar";
import StatusBadge from "@/components/StatusBadge";
import MasterCard from "@/components/MasterCard";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { categoryIcon, categoryName } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "პროფილი" };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const [user, bookings, favorites, reviews] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.booking.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { master: { include: { user: { select: { name: true } } } } },
    }),
    prisma.favorite.findMany({
      where: { customerId: session.user.id },
      include: { master: { include: { user: { select: { name: true } } } } },
    }),
    prisma.review.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { master: { include: { user: { select: { name: true } } } } },
    }),
  ]);
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <Avatar name={user.name} size={72} />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {user.email}
            {user.phone ? ` · ${user.phone}` : ""}
          </p>
          <p className="mt-1 text-xs text-muted">
            წევრი {user.createdAt.toLocaleDateString("ka-GE")}-დან
          </p>
        </div>
        <Link href="/bookings/new" className="btn-gold">
          + ახალი შეკვეთა
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Orders */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">შეკვეთების ისტორია ({bookings.length})</h2>
          {bookings.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted">შეკვეთები ჯერ არ გაქვს.</div>
          ) : (
            <ul className="space-y-3">
              {bookings.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/bookings/${b.id}`}
                    className="card flex items-center gap-4 p-4 transition hover:border-gold/50"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-graphite text-xl">
                      {categoryIcon(b.category)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{categoryName(b.category)}</p>
                      <p className="truncate text-sm text-muted">
                        {b.master ? `ოსტატი: ${b.master.user.name}` : "ღია მოთხოვნა"} · {b.city}
                        {b.price ? ` · ${b.price}₾` : ""}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Reviews */}
          <h2 className="mb-4 mt-10 text-lg font-semibold">ჩემი შეფასებები ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted">შეფასებები ჯერ არ დაგიტოვებია.</div>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <Link href={`/masters/${r.masterId}`} className="font-medium hover:text-gold-light">
                      {r.master.user.name}
                    </Link>
                    <span className="text-gold">{"★".repeat(r.rating)}</span>
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-muted">{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Favorites */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">შენახული ოსტატები ({favorites.length})</h2>
          {favorites.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted">
              შენახული ოსტატები არ გაქვს —{" "}
              <Link href="/masters" className="text-gold-light hover:underline">
                დაათვალიერე
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((f) => (
                <MasterCard key={f.id} master={f.master} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
