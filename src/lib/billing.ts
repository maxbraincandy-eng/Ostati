import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";
import { PREMIUM_PLANS, type PremiumPlanId } from "@/lib/premium";

/** Real payments switch on when Bank of Georgia merchant credentials are set. */
export function bogEnabled() {
  return !!(process.env.BOG_CLIENT_ID && process.env.BOG_CLIENT_SECRET);
}

export function appUrl() {
  return (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Marks a payment PAID and extends the master's premium period. Idempotent. */
export async function fulfillPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { master: { select: { id: true, userId: true, premiumUntil: true } } },
  });
  if (!payment || payment.status === "PAID") return payment;

  const base =
    payment.master.premiumUntil && payment.master.premiumUntil > new Date()
      ? payment.master.premiumUntil
      : new Date();
  const until = new Date(base);
  until.setMonth(until.getMonth() + payment.months);

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: "PAID" } }),
    prisma.masterProfile.update({
      where: { id: payment.master.id },
      data: { premium: true, premiumUntil: until },
    }),
  ]);

  const plan = PREMIUM_PLANS.find((p) => p.id === payment.plan);
  await notify(
    payment.master.userId,
    "Premium აქტიურია ⭐",
    `პაკეტი: ${plan?.name ?? payment.plan} · მოქმედებს ${until.toLocaleDateString("ka-GE")}-მდე`,
    "/dashboard"
  );
  return payment;
}

// --- Bank of Georgia Payments API (https://api.bog.ge/docs) ---

const BOG_OAUTH_URL = "https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token";
const BOG_API_URL = "https://api.bog.ge/payments/v1";

async function bogToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.BOG_CLIENT_ID}:${process.env.BOG_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch(BOG_OAUTH_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`BOG auth failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/** Creates a BOG hosted-checkout order; returns the URL to redirect the payer to. */
export async function bogCreateOrder(opts: {
  paymentId: string;
  planId: PremiumPlanId;
  amount: number;
}): Promise<string> {
  const token = await bogToken();
  const res = await fetch(`${BOG_API_URL}/ecommerce/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept-Language": "ka",
      "Idempotency-Key": opts.paymentId,
    },
    body: JSON.stringify({
      callback_url: `${appUrl()}/api/payments/callback`,
      external_order_id: opts.paymentId,
      purchase_units: {
        currency: "GEL",
        total_amount: opts.amount,
        basket: [
          {
            product_id: `premium-${opts.planId.toLowerCase()}`,
            description: `Ostati Premium — ${opts.planId}`,
            quantity: 1,
            unit_price: opts.amount,
          },
        ],
      },
      redirect_urls: {
        success: `${appUrl()}/dashboard/premium?payment=success`,
        fail: `${appUrl()}/dashboard/premium?payment=fail`,
      },
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`BOG order failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  const data = (await res.json()) as {
    id: string;
    _links?: { redirect?: { href?: string } };
  };
  const redirect = data._links?.redirect?.href;
  if (!redirect) throw new Error("BOG order: no redirect link in response");

  await prisma.payment.update({
    where: { id: opts.paymentId },
    data: { providerOrderId: data.id },
  });
  return redirect;
}

/**
 * Fetches order state directly from BOG. The callback handler uses this
 * instead of trusting the callback body — the API response is authoritative.
 */
export async function bogGetOrder(orderId: string): Promise<{
  externalOrderId: string;
  statusKey: string;
} | null> {
  const token = await bogToken();
  const res = await fetch(`${BOG_API_URL}/receipt/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    external_order_id?: string;
    order_status?: { key?: string };
  };
  if (!data.external_order_id || !data.order_status?.key) return null;
  return { externalOrderId: data.external_order_id, statusKey: data.order_status.key };
}
