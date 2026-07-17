import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notify } from "@/lib/notify";

const schema = z.object({
  bookingId: z.string(),
  subject: z.string().min(3).max(150),
  body: z.string().max(3000).default(""),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "არასწორი მონაცემები" }, { status: 400 });

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: { master: { select: { userId: true } } },
  });
  if (!booking) return NextResponse.json({ error: "შეკვეთა ვერ მოიძებნა" }, { status: 404 });
  if (booking.customerId !== user.id && booking.master?.userId !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const complaint = await prisma.complaint.create({
    data: {
      bookingId: booking.id,
      authorId: user.id,
      subject: parsed.data.subject,
      body: parsed.data.body,
    },
  });

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await Promise.all(
    admins.map((a) => notify(a.id, "ახალი საჩივარი", parsed.data.subject, "/admin"))
  );
  return NextResponse.json({ id: complaint.id }, { status: 201 });
}
