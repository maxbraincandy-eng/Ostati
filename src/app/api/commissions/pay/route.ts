import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { bogCreateOrder, bogEnabled, fulfillPayment } from "@/lib/billing";

/** Master pays their outstanding platform commission balance in one checkout. */
export async function POST() {
  const user = await requireUser();
  if (!user?.masterId) return NextResponse.json({ error: "მხოლოდ ოსტატებისთვის" }, { status: 403 });

  const pending = await prisma.commission.aggregate({
    where: { masterId: user.masterId, status: "PENDING" },
    _sum: { amount: true },
  });
  const total = pending._sum.amount ?? 0;
  if (total <= 0) {
    return NextResponse.json({ error: "გადასახდელი საკომისიო არ გაქვს" }, { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: {
      masterId: user.masterId,
      amount: total,
      plan: "",
      months: 0,
      kind: "COMMISSION",
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
      productId: "commission",
      description: "Ostati — პლატფორმის საკომისიო",
      amount: total,
      returnPath: "/dashboard",
    });
    return NextResponse.json({ redirect });
  } catch (err) {
    console.error("BOG commission checkout error:", err);
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return NextResponse.json(
      { error: "გადახდის ინიციალიზაცია ვერ მოხერხდა — სცადე მოგვიანებით" },
      { status: 502 }
    );
  }
}
