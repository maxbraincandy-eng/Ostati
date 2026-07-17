import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notify } from "@/lib/notify";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().max(500).default(""),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const request = await prisma.verificationRequest.findUnique({
    where: { id: params.id },
    include: { master: { select: { id: true, userId: true } } },
  });
  if (!request) return NextResponse.json({ error: "not found" }, { status: 404 });

  const approved = parsed.data.action === "approve";
  await prisma.$transaction([
    prisma.verificationRequest.update({
      where: { id: request.id },
      data: { status: approved ? "APPROVED" : "REJECTED", note: parsed.data.note },
    }),
    prisma.masterProfile.update({
      where: { id: request.master.id },
      data: { verified: approved },
    }),
  ]);

  await notify(
    request.master.userId,
    approved ? "ვერიფიკაცია დადასტურდა ✓" : "ვერიფიკაცია ვერ დადასტურდა",
    approved ? "ახლა ხარ Verified Ostati Professional" : parsed.data.note || "სცადე თავიდან სწორი დოკუმენტებით",
    approved ? `/masters/${request.master.id}` : "/dashboard/verification"
  );
  return NextResponse.json({ ok: true });
}
