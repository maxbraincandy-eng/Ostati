import Link from "next/link";
import Logo from "@/components/Logo";
import Avatar from "@/components/Avatar";
import NavAuthButtons from "@/components/NavAuthButtons";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function Navbar() {
  const session = await getSession();
  const user = session?.user;
  const unread = user
    ? await prisma.notification.count({ where: { userId: user.id, read: false } })
    : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-graphite-border bg-ink/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <div className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link href="/masters" className="transition hover:text-white">
            ოსტატები
          </Link>
          <Link href="/ai" className="transition hover:text-white">
            AI დამხმარე
          </Link>
          {user && (
            <Link href="/bookings/new" className="transition hover:text-white">
              შეკვეთა
            </Link>
          )}
          {user?.role === "MASTER" && (
            <Link href="/dashboard" className="transition hover:text-white">
              Dashboard
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="text-gold-light transition hover:text-gold">
              Admin
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/notifications"
                className="relative rounded-lg p-2 text-muted transition hover:text-white"
                aria-label="შეტყობინებები"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />
                </svg>
                {unread > 0 && (
                  <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-gold text-[10px] font-bold text-ink">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              <Link href="/profile" className="flex items-center gap-2">
                <Avatar name={user.name ?? "?"} size={34} />
                <span className="hidden text-sm font-medium sm:block">{user.name}</span>
              </Link>
              <NavAuthButtons signedIn />
            </>
          ) : (
            <NavAuthButtons />
          )}
        </div>
      </nav>
    </header>
  );
}
