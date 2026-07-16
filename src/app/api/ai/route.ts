import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeProblem } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

const schema = z.object({ problem: z.string().min(3).max(2000) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "აღწერე პრობლემა" }, { status: 400 });
  }

  const analysis = await analyzeProblem(parsed.data.problem);
  const masters = await prisma.masterProfile.findMany({
    where: { category: analysis.category },
    orderBy: [{ premium: "desc" }, { ratingAvg: "desc" }],
    take: 3,
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({ analysis, masters });
}
