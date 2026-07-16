import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { masterId } = await req.json().catch(() => ({}));
  if (typeof masterId !== "string") {
    return NextResponse.json({ error: "masterId required" }, { status: 400 });
  }
  await prisma.favorite.upsert({
    where: { customerId_masterId: { customerId: user.id, masterId } },
    update: {},
    create: { customerId: user.id, masterId },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { masterId } = await req.json().catch(() => ({}));
  if (typeof masterId !== "string") {
    return NextResponse.json({ error: "masterId required" }, { status: 400 });
  }
  await prisma.favorite.deleteMany({ where: { customerId: user.id, masterId } });
  return NextResponse.json({ ok: true });
}
