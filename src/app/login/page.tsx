import LoginForm from "./LoginForm";

export const metadata = { title: "შესვლა" };

export default function LoginPage() {
  const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-3xl font-bold">შესვლა</h1>
      <p className="mt-2 text-center text-sm text-muted">გამარჯობა, დაბრუნებას გილოცავ 👋</p>
      <LoginForm googleEnabled={googleEnabled} />
    </div>
  );
}
