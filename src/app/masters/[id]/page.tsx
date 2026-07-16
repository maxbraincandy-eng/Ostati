import Link from "next/link";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import RatingStars from "@/components/RatingStars";
import VerifiedBadge from "@/components/VerifiedBadge";
import FavoriteButton from "@/components/FavoriteButton";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { categoryIcon, categoryName } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function MasterProfilePage({ params }: { params: { id: string } }) {
  const master = await prisma.masterProfile.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, phone: true } },
      portfolio: { orderBy: { createdAt: "desc" } },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { customer: { select: { name: true } } },
      },
    },
  });
  if (!master) notFound();

  const session = await getSession();
  const favorited = session?.user
    ? !!(await prisma.favorite.findUnique({
        where: { customerId_masterId: { customerId: session.user.id, masterId: master.id } },
      }))
    : false;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="card flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-8">
        <Avatar name={master.user.name} size={96} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold md:text-3xl">{master.user.name}</h1>
            {master.verified && <VerifiedBadge />}
            {master.premium && (
              <span className="rounded-full bg-gradient-to-r from-gold-light to-gold-dark px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
                Premium
              </span>
            )}
          </div>
          <p className="mt-1 text-muted">
            {categoryIcon(master.category)} {categoryName(master.category)} · {master.city}
          </p>
          <div className="mt-2">
            <RatingStars rating={master.ratingAvg} count={master.reviewCount} />
          </div>
          {master.bio && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85">{master.bio}</p>}
        </div>
        <div className="flex flex-col gap-2 md:w-52">
          <Link
            href={`/bookings/new?master=${master.id}&category=${master.category}`}
            className="btn-gold w-full text-center"
          >
            შეკვეთა
          </Link>
          <FavoriteButton masterId={master.id} initialFavorited={favorited} signedIn={!!session?.user} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Details */}
        <div className="card h-fit p-6">
          <h2 className="mb-4 text-lg font-semibold">დეტალები</h2>
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">გამოცდილება</dt>
              <dd className="font-medium">{master.experienceYears} წელი</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">სამუშაო საათები</dt>
              <dd className="font-medium">{master.workHours}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">ფასი</dt>
              <dd className="font-semibold text-gold-light">
                {master.priceFrom}–{master.priceTo}₾
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">ტელეფონი</dt>
              <dd className="font-medium">
                {session?.user ? (
                  master.user.phone ?? "—"
                ) : (
                  <Link href="/login" className="text-gold-light hover:underline">
                    შესვლა სანახავად
                  </Link>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">ქალაქი</dt>
              <dd className="font-medium">{master.city}</dd>
            </div>
          </dl>
        </div>

        {/* Portfolio */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-semibold">პორტფოლიო</h2>
            {master.portfolio.length === 0 ? (
              <p className="text-sm text-muted">პორტფოლიო ჯერ ცარიელია.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {master.portfolio.map((p) => (
                  <figure key={p.id} className="overflow-hidden rounded-xl border border-graphite-border">
                    <div
                      className="grid h-36 place-items-center text-4xl"
                      style={{
                        background: `linear-gradient(135deg, hsl(${p.imageHue} 35% 22%), hsl(${(p.imageHue + 30) % 360} 40% 14%))`,
                      }}
                      aria-hidden
                    >
                      {categoryIcon(master.category)}
                    </div>
                    <figcaption className="p-4">
                      <p className="font-medium">{p.title}</p>
                      {p.description && <p className="mt-1 text-sm text-muted">{p.description}</p>}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="card mt-6 p-6">
            <h2 className="mb-4 text-lg font-semibold">
              მიმოხილვები <span className="text-sm font-normal text-muted">({master.reviewCount})</span>
            </h2>
            {master.reviews.length === 0 ? (
              <p className="text-sm text-muted">შეფასებები ჯერ არ არის.</p>
            ) : (
              <ul className="space-y-5">
                {master.reviews.map((r) => (
                  <li key={r.id} className="border-b border-graphite-border pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.customer.name} size={36} />
                      <div>
                        <p className="text-sm font-medium">{r.customer.name}</p>
                        <RatingStars rating={r.rating} />
                      </div>
                      <span className="ml-auto text-xs text-muted">
                        {r.createdAt.toLocaleDateString("ka-GE")}
                      </span>
                    </div>
                    {r.comment && <p className="mt-2 text-sm leading-relaxed text-white/85">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
