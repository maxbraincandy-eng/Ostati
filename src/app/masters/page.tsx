import SearchBar from "@/components/SearchBar";
import MasterCard from "@/components/MasterCard";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, categoryName } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "ოსტატები" };

export default async function MastersPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; city?: string };
}) {
  const { q = "", category = "", city = "" } = searchParams;

  // Free-text query matches category names too ("ელექტრიკი" → electrician).
  const matchedCategories = q
    ? CATEGORIES.filter((c) => c.name.includes(q.trim())).map((c) => c.slug)
    : [];

  const masters = await prisma.masterProfile.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(city ? { city } : {}),
      ...(q
        ? {
            OR: [
              { user: { name: { contains: q.trim() } } },
              { bio: { contains: q.trim() } },
              ...(matchedCategories.length ? [{ category: { in: matchedCategories } }] : []),
            ],
          }
        : {}),
    },
    orderBy: [{ premium: "desc" }, { ratingAvg: "desc" }, { reviewCount: "desc" }],
    include: { user: { select: { name: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">
        {category ? categoryName(category) : "ყველა ოსტატი"}
        {city && <span className="text-muted"> · {city}</span>}
      </h1>
      <p className="mt-1 text-sm text-muted">ნაპოვნია {masters.length} ოსტატი</p>
      <div className="mt-6">
        <SearchBar initialQuery={q} initialCategory={category} initialCity={city} />
      </div>
      {masters.length === 0 ? (
        <div className="card mt-10 p-12 text-center text-muted">
          ამ პარამეტრებით ოსტატი ვერ მოიძებნა — სცადე სხვა კატეგორია ან ქალაქი.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {masters.map((m) => (
            <MasterCard key={m.id} master={m} />
          ))}
        </div>
      )}
    </div>
  );
}
