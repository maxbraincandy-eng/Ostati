import { redirect } from "next/navigation";
import VerificationForm from "./VerificationForm";
import VerifiedBadge from "@/components/VerifiedBadge";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "ვერიფიკაცია" };

export default async function VerificationPage() {
  const session = await getSession();
  if (!session?.user?.masterId) redirect("/profile");

  const request = await prisma.verificationRequest.findUnique({
    where: { masterId: session.user.masterId },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">ვერიფიკაცია</h1>
      <p className="mt-2 text-sm text-muted">
        ვერიფიცირებული პროფილები იღებენ <VerifiedBadge /> ბეჯს, მეტ ნდობას და მეტ შეკვეთას.
      </p>

      {request?.status === "APPROVED" ? (
        <div className="card mt-8 border-emerald-500/30 p-8 text-center">
          <p className="text-2xl">✅</p>
          <p className="mt-2 text-lg font-semibold text-emerald-300">პროფილი ვერიფიცირებულია</p>
          <p className="mt-1 text-sm text-muted">Verified Ostati Professional ბეჯი აქტიურია შენს პროფილზე.</p>
        </div>
      ) : request?.status === "PENDING" ? (
        <div className="card mt-8 border-yellow-500/30 p-8 text-center">
          <p className="text-2xl">⏳</p>
          <p className="mt-2 text-lg font-semibold text-yellow-300">მოთხოვნა განიხილება</p>
          <p className="mt-1 text-sm text-muted">
            გაგზავნილია {request.createdAt.toLocaleDateString("ka-GE")} — ადმინისტრატორი მალე განიხილავს.
          </p>
        </div>
      ) : (
        <>
          {request?.status === "REJECTED" && (
            <div className="card mt-8 border-red-500/30 p-5">
              <p className="font-medium text-red-300">წინა მოთხოვნა ვერ დადასტურდა</p>
              {request.note && <p className="mt-1 text-sm text-muted">მიზეზი: {request.note}</p>}
              <p className="mt-1 text-sm text-muted">შეასწორე და გააგზავნე თავიდან.</p>
            </div>
          )}
          <VerificationForm />
        </>
      )}
    </div>
  );
}
