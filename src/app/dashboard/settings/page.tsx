import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import PortfolioManager from "./PortfolioManager";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "პროფილის რედაქტირება" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user?.masterId) redirect("/profile");

  const profile = await prisma.masterProfile.findUnique({
    where: { id: session.user.masterId },
    include: {
      user: { select: { phone: true } },
      portfolio: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!profile) redirect("/profile");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">პროფილის რედაქტირება</h1>
      <p className="mt-1 text-sm text-muted">განაახლე ინფორმაცია, რომელსაც კლიენტები ხედავენ</p>

      <ProfileForm
        initial={{
          category: profile.category,
          city: profile.city,
          bio: profile.bio,
          experienceYears: profile.experienceYears,
          priceFrom: profile.priceFrom,
          priceTo: profile.priceTo,
          workHours: profile.workHours,
          phone: profile.user.phone ?? "",
        }}
      />

      <PortfolioManager
        items={profile.portfolio.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          imageUrl: p.imageUrl,
          imageHue: p.imageHue,
        }))}
      />
    </div>
  );
}
