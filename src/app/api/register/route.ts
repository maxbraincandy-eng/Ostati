import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, CITIES } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(6).max(30),
  password: z.string().min(8).max(100),
  role: z.enum(["CUSTOMER", "MASTER"]),
  category: z.string().optional(),
  city: z.string().optional(),
  experienceYears: z.number().int().min(0).max(60).optional(),
  priceFrom: z.number().int().min(0).optional(),
  priceTo: z.number().int().min(0).optional(),
  bio: z.string().max(1000).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "შეიყვანე კორექტული მონაცემები" }, { status: 400 });
  }
  const data = parsed.data;
  const email = data.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "ამ ელფოსტით ანგარიში უკვე არსებობს" }, { status: 409 });
  }

  if (data.role === "MASTER") {
    const validCategory = CATEGORIES.some((c) => c.slug === data.category);
    const validCity = (CITIES as readonly string[]).includes(data.city ?? "");
    if (!validCategory || !validCity) {
      return NextResponse.json({ error: "აირჩიე პროფესია და ქალაქი" }, { status: 400 });
    }
  }

  const passwordHash = await hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email,
      phone: data.phone.trim(),
      passwordHash,
      role: data.role,
      ...(data.role === "MASTER"
        ? {
            masterProfile: {
              create: {
                category: data.category!,
                city: data.city!,
                experienceYears: data.experienceYears ?? 0,
                priceFrom: data.priceFrom ?? 0,
                priceTo: data.priceTo ?? 0,
                bio: data.bio ?? "",
              },
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}
