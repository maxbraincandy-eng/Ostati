import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notify } from "@/lib/notify";

/** Customer accepts or declines an offer on their booking. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { action } = await req.json().catch(() => ({}));
  if (action !== "accept" && action !== "decline") {
    return NextResponse.json({ error: "action must be accept|decline" }, { status: 400 });
  }

  const offer = await prisma.offer.findUnique({
    where: { id: params.id },
    include: { booking: true, master: { select: { userId: true } } },
  });
  if (!offer) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (offer.booking.customerId !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (offer.status !== "PENDING" || offer.booking.status !== "PENDING") {
    return NextResponse.json({ error: "შეთავაზება აღარ არის აქტიური" }, { status: 400 });
  }

  if (action === "decline") {
    await prisma.offer.update({ where: { id: offer.id }, data: { status: "DECLINED" } });
    return NextResponse.json({ ok: true });
  }

  await prisma.$transaction([
    prisma.offer.update({ where: { id: offer.id }, data: { status: "ACCEPTED" } }),
    prisma.offer.updateMany({
      where: { bookingId: offer.bookingId, id: { not: offer.id }, status: "PENDING" },
      data: { status: "DECLINED" },
    }),
    prisma.booking.update({
      where: { id: offer.bookingId },
      data: { masterId: offer.masterId, price: offer.price, status: "ACCEPTED" },
    }),
  ]);

  await notify(
    offer.master.userId,
    "შეთავაზება მიღებულია 🎉",
    `${offer.price}₾ — შეგიძლია დაიწყო სამუშაო`,
    `/bookings/${offer.bookingId}`
  );
  return NextResponse.json({ ok: true });
}
