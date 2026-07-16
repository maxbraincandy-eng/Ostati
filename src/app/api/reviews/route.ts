import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notify } from "@/lib/notify";

const schema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).default(""),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "არასწორი მონაცემები" }, { status: 400 });
  const { bookingId, rating, comment } = parsed.data;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { review: true, master: { select: { id: true, userId: true } } },
  });
  if (!booking) return NextResponse.json({ error: "შეკვეთა ვერ მოიძებნა" }, { status: 404 });
  if (booking.customerId !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (booking.status !== "COMPLETED" || !booking.master) {
    return NextResponse.json({ error: "შეფასება მხოლოდ დასრულებულ სამუშაოზეა შესაძლებელი" }, { status: 400 });
  }
  if (booking.review) {
    return NextResponse.json({ error: "შეფასება უკვე დატოვებული გაქვს" }, { status: 409 });
  }

  await prisma.review.create({
    data: {
      bookingId,
      customerId: user.id,
      masterId: booking.master.id,
      rating,
      comment,
    },
  });

  // Recompute the master's cached aggregate.
  const agg = await prisma.review.aggregate({
    where: { masterId: booking.master.id },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.masterProfile.update({
    where: { id: booking.master.id },
    data: { ratingAvg: agg._avg.rating ?? 0, reviewCount: agg._count },
  });

  await notify(booking.master.userId, "ახალი შეფასება", `${rating} ★`, `/masters/${booking.master.id}`);
  return NextResponse.json({ ok: true }, { status: 201 });
}
