import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone, requestOtp, smsEnabled } from "@/lib/otp";

const schema = z.object({ phone: z.string().min(9).max(20) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "შეიყვანე ტელეფონის ნომერი" }, { status: 400 });

  const phone = normalizePhone(parsed.data.phone);
  if (!/^\+\d{10,15}$/.test(phone)) {
    return NextResponse.json({ error: "ნომრის ფორმატი არასწორია" }, { status: 400 });
  }

  const result = await requestOtp(phone);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 429 });

  return NextResponse.json({
    ok: true,
    phone,
    // devCode is only present when no SMS provider is configured (demo mode).
    ...(result.devCode ? { devCode: result.devCode, demo: true } : {}),
    sms: smsEnabled(),
  });
}
