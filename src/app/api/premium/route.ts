import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notify } from "@/lib/notify";
import { PREMIUM_PLANS } from "@/lib/premium";

const schema = z.object({ plan: z.enum(["BASIC", "STANDARD", "PRO"]) });

/**
 * Demo checkout: records the payment and activates premium immediately.
 * Swap the body of this handler for a real provider (BOG/TBC/Stripe)
 * checkout-session redirect when payment keys are available.
 */
export async function POST(req: Request) {
  const user = await requireUser();
  if (!user?.masterId) return NextResponse.json({ error: "მხოლოდ ოსტატებისთვის" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "აირჩიე პაკეტი" }, { status: 400 });

  const plan = PREMIUM_PLANS.find((p) => p.id === parsed.data.plan)!;

  const current = await prisma.masterProfile.findUnique({
    where: { id: user.masterId },
    select: { premiumUntil: true },
  });
  // Extend from the current expiry when still active, else from now.
  const base =
    current?.premiumUntil && current.premiumUntil > new Date()
      ? current.premiumUntil
      : new Date();
  const until = new Date(base);
  until.setMonth(until.getMonth() + plan.months);

  await prisma.$transaction([
    prisma.payment.create({
      data: { masterId: user.masterId, amount: plan.price, plan: plan.id, months: plan.months },
    }),
    prisma.masterProfile.update({
      where: { id: user.masterId },
      data: { premium: true, premiumUntil: until },
    }),
  ]);

  await notify(
    user.id,
    "Premium აქტიურია ⭐",
    `პაკეტი: ${plan.name} · მოქმედებს ${until.toLocaleDateString("ka-GE")}-მდე`,
    "/dashboard"
  );
  return NextResponse.json({ ok: true, until });
}
