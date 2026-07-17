import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notify } from "@/lib/notify";

const schema = z.object({
  idNumber: z.string().min(5).max(30),
  experienceInfo: z.string().max(2000).default(""),
  documents: z.array(z.string().max(700_000)).min(1).max(5),
});

/** Master submits (or re-submits after rejection) a verification request. */
export async function POST(req: Request) {
  const user = await requireUser();
  if (!user?.masterId) return NextResponse.json({ error: "მხოლოდ ოსტატებისთვის" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "შეავსე ყველა ველი და ატვირთე მინ. 1 დოკუმენტი" }, { status: 400 });
  }

  const existing = await prisma.verificationRequest.findUnique({ where: { masterId: user.masterId } });
  if (existing?.status === "PENDING") {
    return NextResponse.json({ error: "მოთხოვნა უკვე განიხილება" }, { status: 409 });
  }
  if (existing?.status === "APPROVED") {
    return NextResponse.json({ error: "პროფილი უკვე ვერიფიცირებულია" }, { status: 409 });
  }

  await prisma.verificationRequest.upsert({
    where: { masterId: user.masterId },
    update: {
      idNumber: parsed.data.idNumber,
      experienceInfo: parsed.data.experienceInfo,
      documents: JSON.stringify(parsed.data.documents),
      status: "PENDING",
      note: "",
    },
    create: {
      masterId: user.masterId,
      idNumber: parsed.data.idNumber,
      experienceInfo: parsed.data.experienceInfo,
      documents: JSON.stringify(parsed.data.documents),
    },
  });

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await Promise.all(
    admins.map((a) => notify(a.id, "ახალი ვერიფიკაციის მოთხოვნა", user.name ?? "", "/admin"))
  );
  return NextResponse.json({ ok: true }, { status: 201 });
}
