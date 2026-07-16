import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

async function canAccess(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { master: { select: { userId: true } } },
  });
  if (!booking) return null;
  const ok = booking.customerId === userId || booking.master?.userId === userId;
  return ok ? booking : null;
}

export async function GET(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const bookingId = new URL(req.url).searchParams.get("bookingId") ?? "";
  if (!(await canAccess(bookingId, user.id))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const messages = await prisma.message.findMany({
    where: { bookingId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ messages });
}

const postSchema = z.object({ bookingId: z.string(), body: z.string().min(1).max(2000) });

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  if (!(await canAccess(parsed.data.bookingId, user.id))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const message = await prisma.message.create({
    data: { bookingId: parsed.data.bookingId, senderId: user.id, body: parsed.data.body },
  });
  return NextResponse.json({ id: message.id }, { status: 201 });
}
