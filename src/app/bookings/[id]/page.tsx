import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Avatar from "@/components/Avatar";
import StatusBadge from "@/components/StatusBadge";
import BookingActions from "./BookingActions";
import OfferPanel from "./OfferPanel";
import Chat from "./Chat";
import ReviewForm from "./ReviewForm";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { categoryIcon, categoryName } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "შეკვეთა" };

export default async function BookingPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const user = session.user;

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      master: { include: { user: { select: { id: true, name: true, phone: true } } } },
      offers: {
        orderBy: { createdAt: "desc" },
        include: { master: { include: { user: { select: { name: true } } } } },
      },
      review: true,
    },
  });
  if (!booking) notFound();

  const isCustomer = booking.customerId === user.id;
  const isAssignedMaster = booking.master?.user.id === user.id;
  const isCategoryMaster =
    user.role === "MASTER" && !booking.masterId && booking.status === "PENDING";
  if (!isCustomer && !isAssignedMaster && !isCategoryMaster && user.role !== "ADMIN") {
    notFound();
  }

  const photos: string[] = (() => {
    try {
      return JSON.parse(booking.photos);
    } catch {
      return [];
    }
  })();

  const myOffer = user.masterId
    ? booking.offers.find((o) => o.masterId === user.masterId) ?? null
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          {categoryIcon(booking.category)} {categoryName(booking.category)}
        </h1>
        <StatusBadge status={booking.status} />
      </div>
      <p className="mt-1 text-sm text-muted">
        შეიქმნა: {booking.createdAt.toLocaleDateString("ka-GE")} · {booking.city}
        {booking.price ? ` · შეთანხმებული ფასი: ${booking.price}₾` : ""}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="card p-6">
            <h2 className="mb-3 text-lg font-semibold">აღწერა</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">
              {booking.description}
            </p>
            <dl className="mt-5 grid gap-4 border-t border-graphite-border pt-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">მისამართი</dt>
                <dd className="mt-0.5 font-medium">{booking.address}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">სასურველი დრო</dt>
                <dd className="mt-0.5 font-medium">
                  {booking.preferredDate.replace("T", " · ")}
                </dd>
              </div>
            </dl>
            {photos.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-3">
                {photos.map((p, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={p} alt={`ფოტო ${i + 1}`} className="h-28 w-28 rounded-xl border border-graphite-border object-cover" />
                ))}
              </div>
            )}
          </div>

          <OfferPanel
            bookingId={booking.id}
            bookingStatus={booking.status}
            isCustomer={isCustomer}
            canOffer={isCategoryMaster || (isAssignedMaster && booking.status === "PENDING")}
            myOffer={myOffer ? { price: myOffer.price, message: myOffer.message, status: myOffer.status } : null}
            offers={booking.offers.map((o) => ({
              id: o.id,
              price: o.price,
              message: o.message,
              status: o.status,
              masterName: o.master.user.name,
              masterProfileId: o.masterId,
            }))}
          />

          {(isCustomer || isAssignedMaster) && booking.masterId && (
            <Chat bookingId={booking.id} myUserId={user.id} />
          )}

          {isCustomer && booking.status === "COMPLETED" && !booking.review && (
            <ReviewForm bookingId={booking.id} />
          )}
          {booking.review && (
            <div className="card p-6">
              <h2 className="mb-2 text-lg font-semibold">შენი შეფასება</h2>
              <p className="text-gold">{"★".repeat(booking.review.rating)}</p>
              {booking.review.comment && (
                <p className="mt-2 text-sm text-white/85">{booking.review.comment}</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
              მხარეები
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={booking.customer.name} size={40} />
                <div>
                  <p className="text-sm font-medium">{booking.customer.name}</p>
                  <p className="text-xs text-muted">დამკვეთი{isAssignedMaster && booking.customer.phone ? ` · ${booking.customer.phone}` : ""}</p>
                </div>
              </div>
              {booking.master ? (
                <div className="flex items-center gap-3">
                  <Avatar name={booking.master.user.name} size={40} />
                  <div>
                    <Link href={`/masters/${booking.master.id}`} className="text-sm font-medium hover:text-gold-light">
                      {booking.master.user.name}
                    </Link>
                    <p className="text-xs text-muted">ოსტატი{isCustomer && booking.master.user.phone ? ` · ${booking.master.user.phone}` : ""}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted">ოსტატი ჯერ არ არის შერჩეული — ელოდები შეთავაზებებს</p>
              )}
            </div>
          </div>
          <BookingActions
            bookingId={booking.id}
            status={booking.status}
            role={isAssignedMaster ? "master" : isCustomer ? "customer" : "viewer"}
          />
        </div>
      </div>
    </div>
  );
}
