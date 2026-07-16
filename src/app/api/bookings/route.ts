import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notify } from "@/lib/notify";
import { CATEGORIES, CITIES, categoryName } from "@/lib/constants";

const schema = z.object({
  masterId: z.string().nullable().optional(),
  category: z.string().refine((s) => CATEGORIES.some((c) => c.slug === s)),
  description: z.string().min(5).max(3000),
  address: z.string().min(3).max(300),
  city: z.string().refine((s) => (CITIES as readonly string[]).includes(s)),
  preferredDate: z.string().min(1).max(50),
  photos: z.array(z.string().max(700_000)).max(4).default([]),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "შეიყვანე კორექტული მონაცემები" }, { status: 400 });
  }
  const data = parsed.data;

  let masterUserId: string | null = null;
  if (data.masterId) {
    const master = await prisma.masterProfile.findUnique({
      where: { id: data.masterId },
      select: { userId: true },
    });
    if (!master) return NextResponse.json({ error: "ოსტატი ვერ მოიძებნა" }, { status: 404 });
    masterUserId = master.userId;
  }

  const booking = await prisma.booking.create({
    data: {
      customerId: user.id,
      masterId: data.masterId ?? null,
      category: data.category,
      description: data.description,
      address: data.address,
      city: data.city,
      preferredDate: data.preferredDate,
      photos: JSON.stringify(data.photos),
    },
  });

  if (masterUserId) {
    await notify(
      masterUserId,
      "ახალი შეკვეთა",
      `${categoryName(data.category)} — ${data.city}`,
      `/bookings/${booking.id}`
    );
  }

  return NextResponse.json({ id: booking.id }, { status: 201 });
}
