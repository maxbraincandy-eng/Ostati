import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const createSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(500).default(""),
  imageUrl: z.string().max(700_000).default(""),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user?.masterId) return NextResponse.json({ error: "მხოლოდ ოსტატებისთვის" }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "არასწორი მონაცემები" }, { status: 400 });

  const count = await prisma.portfolioItem.count({ where: { masterId: user.masterId } });
  if (count >= 12) {
    return NextResponse.json({ error: "პორტფოლიოში მაქსიმუმ 12 ნამუშევარია" }, { status: 400 });
  }

  const item = await prisma.portfolioItem.create({
    data: {
      masterId: user.masterId,
      title: parsed.data.title,
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl,
      imageHue: Math.floor(Math.random() * 360),
    },
  });
  return NextResponse.json({ id: item.id }, { status: 201 });
}

export async function DELETE(req: Request) {
  const user = await requireUser();
  if (!user?.masterId) return NextResponse.json({ error: "მხოლოდ ოსტატებისთვის" }, { status: 403 });

  const { id } = await req.json().catch(() => ({}));
  if (typeof id !== "string") return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.portfolioItem.deleteMany({ where: { id, masterId: user.masterId } });
  return NextResponse.json({ ok: true });
}
