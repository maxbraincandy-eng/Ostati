import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { CATEGORIES, CITIES } from "@/lib/constants";

const schema = z.object({
  category: z.string().refine((s) => CATEGORIES.some((c) => c.slug === s)).optional(),
  city: z.string().refine((s) => (CITIES as readonly string[]).includes(s)).optional(),
  bio: z.string().max(1000).optional(),
  experienceYears: z.number().int().min(0).max(60).optional(),
  priceFrom: z.number().int().min(0).optional(),
  priceTo: z.number().int().min(0).optional(),
  workHours: z.string().max(100).optional(),
  phone: z.string().min(6).max(30).optional(),
});

export async function PATCH(req: Request) {
  const user = await requireUser();
  if (!user?.masterId) return NextResponse.json({ error: "მხოლოდ ოსტატებისთვის" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "არასწორი მონაცემები" }, { status: 400 });
  const { phone, ...profileData } = parsed.data;

  await prisma.masterProfile.update({ where: { id: user.masterId }, data: profileData });
  if (phone) {
    await prisma.user.update({ where: { id: user.id }, data: { phone } });
  }
  return NextResponse.json({ ok: true });
}
