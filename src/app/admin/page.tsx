import { redirect } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import StatusBadge from "@/components/StatusBadge";
import AdminMasterActions from "./AdminMasterActions";
import AdminVerifications from "./AdminVerifications";
import AdminComplaints from "./AdminComplaints";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { categoryName, PLATFORM_COMMISSION } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const [userCount, masters, bookings, completedAgg, verifications, complaints, premiumAgg] =
    await Promise.all([
      prisma.user.count(),
      prisma.masterProfile.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true, phone: true } } },
      }),
      prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          customer: { select: { name: true } },
          master: { include: { user: { select: { name: true } } } },
        },
      }),
      prisma.booking.aggregate({ where: { status: "COMPLETED" }, _sum: { price: true }, _count: true }),
      prisma.verificationRequest.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        include: { master: { include: { user: { select: { name: true } } } } },
      }),
      prisma.complaint.findMany({
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        take: 30,
        include: { author: { select: { name: true } } },
      }),
      prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    ]);

  const gross = completedAgg._sum.price ?? 0;
  const commissionRevenue = Math.round(gross * PLATFORM_COMMISSION);
  const premiumRevenue = premiumAgg._sum.amount ?? 0;
  const stats = [
    { label: "მომხმარებელი", value: userCount },
    { label: "ოსტატი", value: masters.length },
    { label: "დასრულებული სამუშაო", value: completedAgg._count },
    { label: "შემოსავალი (საკომისიო + Premium)", value: `${commissionRevenue + premiumRevenue}₾` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">
        Admin Panel <span className="gold-text">·</span> Ostati
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-2xl font-bold text-gold-light">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="mt-2 text-xs text-muted">
        საკომისიო ({Math.round(PLATFORM_COMMISSION * 100)}%): {commissionRevenue}₾ · Premium გამოწერები: {premiumRevenue}₾
      </p>

      {/* Verification queue */}
      <h2 className="mb-4 mt-12 text-lg font-semibold">
        ვერიფიკაციის მოთხოვნები{" "}
        {verifications.length > 0 && (
          <span className="ml-1 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold-light">
            {verifications.length}
          </span>
        )}
      </h2>
      <AdminVerifications
        requests={verifications.map((v) => ({
          id: v.id,
          masterName: v.master.user.name,
          masterProfileId: v.masterId,
          idNumber: v.idNumber,
          experienceInfo: v.experienceInfo,
          documents: (() => {
            try {
              return JSON.parse(v.documents) as string[];
            } catch {
              return [];
            }
          })(),
          createdAt: v.createdAt.toLocaleDateString("ka-GE"),
        }))}
      />

      {/* Complaints */}
      <h2 className="mb-4 mt-12 text-lg font-semibold">
        საჩივრები{" "}
        {complaints.filter((c) => c.status === "OPEN").length > 0 && (
          <span className="ml-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300">
            {complaints.filter((c) => c.status === "OPEN").length} ღია
          </span>
        )}
      </h2>
      <AdminComplaints
        complaints={complaints.map((c) => ({
          id: c.id,
          subject: c.subject,
          body: c.body,
          authorName: c.author.name,
          bookingId: c.bookingId,
          status: c.status,
          resolution: c.resolution,
          createdAt: c.createdAt.toLocaleDateString("ka-GE"),
        }))}
      />

      {/* Masters management */}
      <h2 className="mb-4 mt-12 text-lg font-semibold">ოსტატების მართვა</h2>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-graphite-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="p-4">ოსტატი</th>
              <th className="p-4">კატეგორია</th>
              <th className="p-4">ქალაქი</th>
              <th className="p-4">რეიტინგი</th>
              <th className="p-4">სტატუსი</th>
              <th className="p-4 text-right">მოქმედება</th>
            </tr>
          </thead>
          <tbody>
            {masters.map((m) => (
              <tr key={m.id} className="border-b border-graphite-border last:border-0">
                <td className="p-4">
                  <Link href={`/masters/${m.id}`} className="flex items-center gap-3 hover:text-gold-light">
                    <Avatar name={m.user.name} size={34} />
                    <div>
                      <p className="font-medium">{m.user.name}</p>
                      <p className="text-xs text-muted">{m.user.email}</p>
                    </div>
                  </Link>
                </td>
                <td className="p-4">{categoryName(m.category)}</td>
                <td className="p-4">{m.city}</td>
                <td className="p-4">
                  {m.ratingAvg > 0 ? `${m.ratingAvg.toFixed(1)} ★ (${m.reviewCount})` : "—"}
                </td>
                <td className="p-4">
                  <span className="flex flex-wrap gap-1">
                    {m.verified && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                        Verified
                      </span>
                    )}
                    {m.premium && (
                      <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs text-gold-light">
                        Premium
                      </span>
                    )}
                    {!m.verified && !m.premium && <span className="text-xs text-muted">—</span>}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <AdminMasterActions masterId={m.id} verified={m.verified} premium={m.premium} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bookings overview */}
      <h2 className="mb-4 mt-12 text-lg font-semibold">ბოლო შეკვეთები</h2>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-graphite-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="p-4">კატეგორია</th>
              <th className="p-4">დამკვეთი</th>
              <th className="p-4">ოსტატი</th>
              <th className="p-4">ფასი</th>
              <th className="p-4">სტატუსი</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-graphite-border last:border-0">
                <td className="p-4">
                  <Link href={`/bookings/${b.id}`} className="hover:text-gold-light">
                    {categoryName(b.category)}
                  </Link>
                </td>
                <td className="p-4">{b.customer.name}</td>
                <td className="p-4">{b.master?.user.name ?? "—"}</td>
                <td className="p-4">{b.price ? `${b.price}₾` : "—"}</td>
                <td className="p-4">
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
