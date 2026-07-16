import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notify } from "@/lib/notify";

const schema = z.object({
  verified: z.boolean().optional(),
  premium: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const master = await prisma.masterProfile.update({
    where: { id: params.id },
    data: parsed.data,
    select: { userId: true, verified: true },
  });

  if (parsed.data.verified === true) {
    await notify(master.userId, "პროფილი ვერიფიცირებულია ✓", "ახლა ხარ Verified Ostati Professional", `/masters/${params.id}`);
  }
  return NextResponse.json({ ok: true });
}
