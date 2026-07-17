import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notify } from "@/lib/notify";
import { PLATFORM_COMMISSION, STATUS_LABELS } from "@/lib/constants";

// Allowed status transitions per actor.
const MASTER_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
};
const CUSTOMER_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CANCELLED"],
  ACCEPTED: ["CANCELLED"],
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { status } = await req.json().catch(() => ({}));
  if (typeof status !== "string") {
    return NextResponse.json({ error: "status required" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { master: { select: { userId: true } } },
  });
  if (!booking) return NextResponse.json({ error: "not found" }, { status: 404 });

  const isCustomer = booking.customerId === user.id;
  const isMaster = booking.master?.userId === user.id;
  if (!isCustomer && !isMaster && user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const allowed =
    user.role === "ADMIN"
      ? true
      : (isMaster ? MASTER_TRANSITIONS : CUSTOMER_TRANSITIONS)[booking.status]?.includes(status);
  if (!allowed) {
    return NextResponse.json({ error: "ეს სტატუსის ცვლილება დაუშვებელია" }, { status: 400 });
  }

  await prisma.booking.update({ where: { id: booking.id }, data: { status } });

  // A completed paid job accrues the platform commission for the master.
  if (status === "COMPLETED" && booking.masterId && booking.price) {
    const amount = Math.max(1, Math.round(booking.price * PLATFORM_COMMISSION));
    await prisma.commission.upsert({
      where: { bookingId: booking.id },
      update: {},
      create: { bookingId: booking.id, masterId: booking.masterId, amount },
    });
  }

  const counterpartId = isMaster ? booking.customerId : booking.master?.userId;
  if (counterpartId) {
    await notify(
      counterpartId,
      `შეკვეთის სტატუსი: ${STATUS_LABELS[status] ?? status}`,
      "",
      `/bookings/${booking.id}`
    );
  }
  return NextResponse.json({ ok: true });
}
