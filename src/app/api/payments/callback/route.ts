import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bogGetOrder, bogEnabled, fulfillPayment } from "@/lib/billing";

/**
 * Bank of Georgia payment webhook.
 * The callback body is treated only as a hint: we re-fetch the order from
 * the BOG API with our own credentials and act on that authoritative state,
 * so a forged callback cannot activate premium.
 */
export async function POST(req: Request) {
  if (!bogEnabled()) return NextResponse.json({ ok: true });

  const payload = (await req.json().catch(() => null)) as {
    body?: { order_id?: string; external_order_id?: string };
  } | null;
  const orderId = payload?.body?.order_id;
  if (!orderId) return NextResponse.json({ ok: true });

  const order = await bogGetOrder(orderId).catch(() => null);
  if (!order) return NextResponse.json({ ok: true });

  const payment = await prisma.payment.findUnique({ where: { id: order.externalOrderId } });
  if (!payment || payment.providerOrderId !== orderId) {
    return NextResponse.json({ ok: true });
  }

  if (order.statusKey === "completed") {
    await fulfillPayment(payment.id);
  } else if (
    payment.status === "PENDING" &&
    ["rejected", "refunded", "blocked"].includes(order.statusKey)
  ) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
  }

  // Always 200 so the bank doesn't retry a handled event.
  return NextResponse.json({ ok: true });
}
