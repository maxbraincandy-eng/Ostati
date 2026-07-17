import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/prisma";

const OTP_TTL_MS = 5 * 60_000;
const RESEND_COOLDOWN_MS = 60_000;
const MAX_ATTEMPTS = 5;

/** Real SMS sending switches on when Twilio credentials are set. */
export function smsEnabled() {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM
  );
}

/** Normalizes to E.164; bare 9-digit numbers are treated as Georgian mobiles. */
export function normalizePhone(raw: string): string {
  let p = raw.replace(/[^\d+]/g, "");
  if (p.startsWith("00")) p = `+${p.slice(2)}`;
  if (!p.startsWith("+")) p = p.length === 9 ? `+995${p}` : `+${p}`;
  return p;
}

function hashCode(phone: string, code: string) {
  return createHash("sha256")
    .update(`${phone}:${code}:${process.env.NEXTAUTH_SECRET ?? ""}`)
    .digest("hex");
}

async function sendSms(phone: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: phone, From: process.env.TWILIO_FROM!, Body: body }),
  });
  if (!res.ok) throw new Error(`SMS send failed: ${res.status}`);
}

export async function requestOtp(
  phone: string
): Promise<{ ok: true; devCode?: string } | { ok: false; error: string }> {
  const recent = await prisma.phoneOtp.findFirst({
    where: { phone, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
  });
  if (recent) return { ok: false, error: "კოდი უკვე გაიგზავნა — სცადე 1 წუთში" };

  const code = String(randomInt(100000, 1000000));
  await prisma.phoneOtp.deleteMany({ where: { phone } });
  await prisma.phoneOtp.create({
    data: { phone, codeHash: hashCode(phone, code), expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });

  if (smsEnabled()) {
    try {
      await sendSms(phone, `Ostati — შესვლის კოდი: ${code}`);
    } catch (err) {
      console.error(err);
      return { ok: false, error: "SMS ვერ გაიგზავნა — სცადე მოგვიანებით" };
    }
    return { ok: true };
  }

  // Demo mode: no SMS provider configured, surface the code to the client.
  console.log(`[dev-otp] ${phone}: ${code}`);
  return { ok: true, devCode: code };
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const otp = await prisma.phoneOtp.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });
  if (!otp || otp.expiresAt < new Date() || otp.attempts >= MAX_ATTEMPTS) return false;

  if (otp.codeHash !== hashCode(phone, code)) {
    await prisma.phoneOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return false;
  }
  await prisma.phoneOtp.deleteMany({ where: { phone } });
  return true;
}
