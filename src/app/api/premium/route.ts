import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PREMIUM_PLANS } from "@/lib/premium";
import { bogCreateOrder, bogEnabled, fulfillPayment } from "@/lib/billing";

const schema = z.object({ plan: z.enum(["BASIC", "STANDARD", "PRO"]) });

/**
 * Premium checkout.
 * - With BOG merchant credentials: creates a pending payment + bank order
 *   and returns the hosted payment page URL; fulfillment happens in the
 *   /api/payments/callback webhook.
 * - Without credentials (demo): fulfills immediately.
 */
export async function POST(req: Request) {
  const user = await requireUser();
  if (!user?.masterId) return NextResponse.json({ error: "მხოლოდ ოსტატებისთვის" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "აირჩიე პაკეტი" }, { status: 400 });

  const plan = PREMIUM_PLANS.find((p) => p.id === parsed.data.plan)!;

  const payment = await prisma.payment.create({
    data: {
      masterId: user.masterId,
      amount: plan.price,
      plan: plan.id,
      months: plan.months,
      status: "PENDING",
      provider: bogEnabled() ? "BOG" : "DEMO",
    },
  });

  if (!bogEnabled()) {
    await fulfillPayment(payment.id);
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    const redirect = await bogCreateOrder({
      paymentId: payment.id,
      planId: plan.id,
      amount: plan.price,
    });
    return NextResponse.json({ redirect });
  } catch (err) {
    console.error("BOG checkout error:", err);
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return NextResponse.json(
      { error: "გადახდის ინიციალიზაცია ვერ მოხერხდა — სცადე მოგვიანებით" },
      { status: 502 }
    );
  }
}
