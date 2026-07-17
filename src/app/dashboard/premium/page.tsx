import { redirect } from "next/navigation";
import PremiumPlans from "./PremiumPlans";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Premium" };

export default async function PremiumPage() {
  const session = await getSession();
  if (!session?.user?.masterId) redirect("/profile");

  const profile = await prisma.masterProfile.findUnique({
    where: { id: session.user.masterId },
    select: { premium: true, premiumUntil: true },
  });

  const activeUntil =
    profile?.premium && profile.premiumUntil && profile.premiumUntil > new Date()
      ? profile.premiumUntil
      : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Premium <span className="gold-text">Ostati</span> პროფილი
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
          გამოირჩიე კონკურენტებისგან — Premium პროფილები ძებნაში ყველაზე მაღლა ჩანან და მეტ კლიენტს იღებენ.
        </p>
        {activeUntil && (
          <p className="mt-4 inline-block rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm text-gold-light">
            ⭐ Premium აქტიურია {activeUntil.toLocaleDateString("ka-GE")}-მდე
          </p>
        )}
      </div>
      <PremiumPlans />
      <p className="mt-8 text-center text-xs text-muted">
        დემო რეჟიმი: გადახდა სიმულირებულია. რეალური გადახდები (ბარათი / ბანკი) Phase 3-ში დაემატება.
      </p>
    </div>
  );
}
