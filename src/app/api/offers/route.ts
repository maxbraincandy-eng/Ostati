import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notify } from "@/lib/notify";

const schema = z.object({
  bookingId: z.string(),
  price: z.number().int().min(1).max(1_000_000),
  message: z.string().max(1000).default(""),
});

/** A master sends an offer on an open (or own-assigned pending) request. */
export async function POST(req: Request) {
  const user = await requireUser();
  if (!user?.masterId) return NextResponse.json({ error: "მხოლოდ ოსტატებისთვის" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "არასწორი მონაცემები" }, { status: 400 });
  const { bookingId, price, message } = parsed.data;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return NextResponse.json({ error: "შეკვეთა ვერ მოიძებნა" }, { status: 404 });
  if (booking.status !== "PENDING") {
    return NextResponse.json({ error: "შეკვეთა აღარ იღებს შეთავაზებებს" }, { status: 400 });
  }
  if (booking.masterId && booking.masterId !== user.masterId) {
    return NextResponse.json({ error: "შეკვეთა სხვა ოსტატზეა მიბმული" }, { status: 403 });
  }

  const offer = await prisma.offer.upsert({
    where: { bookingId_masterId: { bookingId, masterId: user.masterId } },
    update: { price, message, status: "PENDING" },
    create: { bookingId, masterId: user.masterId, price, message },
  });

  await notify(
    booking.customerId,
    "ახალი შეთავაზება",
    `${user.name ?? "ოსტატი"} — ${price}₾`,
    `/bookings/${bookingId}`
  );
  return NextResponse.json({ id: offer.id }, { status: 201 });
}
