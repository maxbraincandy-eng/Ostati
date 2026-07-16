import Link from "next/link";
import Logo from "@/components/Logo";
import { CATEGORIES } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-graphite-border bg-graphite">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            პრემიუმ ხელოსნების Marketplace საქართველოსთვის. სანდო ოსტატები, შემოწმებული
            პროფილები, რეალური შეფასებები.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            კატეგორიები
          </h4>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/masters?category=${c.slug}`} className="text-white/80 hover:text-gold-light">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            პლატფორმა
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/masters" className="text-white/80 hover:text-gold-light">ოსტატების ძებნა</Link></li>
            <li><Link href="/ai" className="text-white/80 hover:text-gold-light">AI დამხმარე</Link></li>
            <li><Link href="/register?role=master" className="text-white/80 hover:text-gold-light">გახდი ოსტატი</Link></li>
            <li><Link href="/bookings/new" className="text-white/80 hover:text-gold-light">შეკვეთის განთავსება</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            კონტაქტი
          </h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li>info@ostati.ge</li>
            <li>+995 32 2 00 00 00</li>
            <li>თბილისი, საქართველო</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-graphite-border py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} Ostati — ყველა უფლება დაცულია
      </div>
    </footer>
  );
}
