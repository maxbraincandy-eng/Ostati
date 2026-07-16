import Link from "next/link";
import Avatar from "@/components/Avatar";
import RatingStars from "@/components/RatingStars";
import VerifiedBadge from "@/components/VerifiedBadge";
import { categoryIcon, categoryName } from "@/lib/constants";

export type MasterCardData = {
  id: string;
  category: string;
  city: string;
  experienceYears: number;
  priceFrom: number;
  priceTo: number;
  verified: boolean;
  premium: boolean;
  ratingAvg: number;
  reviewCount: number;
  user: { name: string };
};

export default function MasterCard({ master }: { master: MasterCardData }) {
  return (
    <div
      className={`card group relative flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-gold/50 ${
        master.premium ? "ring-1 ring-gold/40" : ""
      }`}
    >
      {master.premium && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-gold-light to-gold-dark px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
          Premium
        </span>
      )}
      <div className="flex items-start gap-4">
        <Avatar name={master.user.name} size={56} />
        <div className="min-w-0">
          <Link href={`/masters/${master.id}`} className="font-semibold hover:text-gold-light">
            {master.user.name}
          </Link>
          <p className="mt-0.5 text-sm text-muted">
            {categoryIcon(master.category)} {categoryName(master.category)}
          </p>
          <div className="mt-1.5">
            <RatingStars rating={master.ratingAvg} count={master.reviewCount} />
          </div>
        </div>
      </div>
      {master.verified && (
        <div className="mt-3">
          <VerifiedBadge compact />
        </div>
      )}
      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-graphite-border pt-4 text-sm">
        <div>
          <dt className="text-xs text-muted">გამოცდილება</dt>
          <dd className="mt-0.5 font-medium">{master.experienceYears} წელი</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">ქალაქი</dt>
          <dd className="mt-0.5 font-medium">{master.city}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">ფასი</dt>
          <dd className="mt-0.5 font-medium text-gold-light">
            {master.priceFrom}–{master.priceTo}₾
          </dd>
        </div>
      </dl>
      <div className="mt-5 flex gap-2">
        <Link href={`/masters/${master.id}`} className="btn-ghost flex-1 !px-3 text-center">
          დაკავშირება
        </Link>
        <Link
          href={`/bookings/new?master=${master.id}&category=${master.category}`}
          className="btn-gold flex-1 !px-3 text-center"
        >
          შეკვეთა
        </Link>
      </div>
    </div>
  );
}
