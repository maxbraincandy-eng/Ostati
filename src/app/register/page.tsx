import RegisterForm from "./RegisterForm";

export const metadata = { title: "რეგისტრაცია" };

export default function RegisterPage({ searchParams }: { searchParams: { role?: string } }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-center text-3xl font-bold">რეგისტრაცია</h1>
      <p className="mt-2 text-center text-sm text-muted">
        შემოუერთდი Ostati-ს — როგორც მომხმარებელი ან როგორც ოსტატი
      </p>
      <RegisterForm initialRole={searchParams.role === "master" ? "MASTER" : "CUSTOMER"} />
    </div>
  );
}
