import { redirect } from "next/navigation";
import BookingForm from "./BookingForm";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "ახალი შეკვეთა" };

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: { master?: string; category?: string };
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const master = searchParams.master
    ? await prisma.masterProfile.findUnique({
        where: { id: searchParams.master },
        include: { user: { select: { name: true } } },
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">ახალი შეკვეთა</h1>
      <p className="mt-2 text-sm text-muted">
        {master
          ? `შეკვეთა ეგზავნება ოსტატს: ${master.user.name}`
          : "ღია მოთხოვნა — კატეგორიის ოსტატები დაინახავენ და გამოგიგზავნიან შეთავაზებებს"}
      </p>
      <BookingForm
        masterId={master?.id ?? null}
        masterName={master?.user.name ?? null}
        initialCategory={master?.category ?? searchParams.category ?? ""}
      />
    </div>
  );
}
