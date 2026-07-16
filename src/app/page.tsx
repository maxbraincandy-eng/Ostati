import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import MasterCard from "@/components/MasterCard";
import { CATEGORIES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STEPS = [
  { n: "01", title: "აღწერე პრობლემა", text: "მოძებნე კატეგორიით ან უბრალოდ დაწერე, რა გჭირდება — AI დამხმარე მიგიყვანს სწორ სპეციალისტთან." },
  { n: "02", title: "შეადარე ოსტატები", text: "ნახე ვერიფიცირებული პროფილები, პორტფოლიო, ფასები და რეალური მომხმარებლების შეფასებები." },
  { n: "03", title: "შეუკვეთე მშვიდად", text: "მიიღე შეთავაზებები, აირჩიე საუკეთესო და თვალი ადევნე სამუშაოს სტატუსს პლატფორმაზევე." },
];

export default async function HomePage() {
  const featured = await prisma.masterProfile.findMany({
    orderBy: [{ premium: "desc" }, { ratingAvg: "desc" }],
    take: 6,
    include: { user: { select: { name: true } } },
  });
  const [masterCount, completedCount] = await Promise.all([
    prisma.masterProfile.count(),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="py-16 text-center md:py-24">
        <p className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1 text-xs font-medium text-gold-light">
          პრემიუმ ხელოსნების Marketplace საქართველოში
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          იპოვე <span className="gold-text">სანდო ოსტატი</span> რამდენიმე წუთში
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          პროფესიონალი ხელოსნები, შემოწმებული პროფილებით და რეალური შეფასებებით
        </p>
        <div className="mx-auto mt-10 max-w-4xl">
          <SearchBar />
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted">
          <span><strong className="text-gold-light">{masterCount}+</strong> ოსტატი</span>
          <span><strong className="text-gold-light">{completedCount}+</strong> დასრულებული სამუშაო</span>
          <span><strong className="text-gold-light">100%</strong> ვერიფიცირებადი პროფილები</span>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">მომსახურების კატეგორიები</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/masters?category=${c.slug}`}
              className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:border-gold/50"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-graphite text-xl">
                {c.icon}
              </span>
              <span className="text-sm font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12">
        <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">როგორ მუშაობს</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-6">
              <span className="gold-text text-3xl font-black">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured masters */}
      <section className="py-12">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">გამორჩეული ოსტატები</h2>
          <Link href="/masters" className="text-sm text-gold-light hover:text-gold">
            ყველას ნახვა →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((m) => (
            <MasterCard key={m.id} master={m} />
          ))}
        </div>
      </section>

      {/* CTA for masters */}
      <section className="py-12">
        <div className="card overflow-hidden bg-gradient-to-br from-graphite-light to-graphite p-10 text-center md:p-14">
          <h2 className="text-2xl font-bold md:text-3xl">
            ხარ ხელოსანი? <span className="gold-text">გახდი Ostati</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            შექმენი ვერიფიცირებული პროფილი, მიიღე შეკვეთები და გაზარდე შემოსავალი. Premium
            პროფილით ძებნაში მაღლა გამოჩნდები.
          </p>
          <Link href="/register?role=master" className="btn-gold mt-7 inline-flex px-8">
            დარეგისტრირდი ოსტატად
          </Link>
        </div>
      </section>
    </div>
  );
}
