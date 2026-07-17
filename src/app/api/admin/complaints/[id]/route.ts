import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notify } from "@/lib/notify";

const schema = z.object({ resolution: z.string().min(2).max(2000) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const complaint = await prisma.complaint.update({
    where: { id: params.id },
    data: { status: "RESOLVED", resolution: parsed.data.resolution },
  });

  await notify(
    complaint.authorId,
    "შენი საჩივარი განხილულია",
    parsed.data.resolution,
    `/bookings/${complaint.bookingId}`
  );
  return NextResponse.json({ ok: true });
}
