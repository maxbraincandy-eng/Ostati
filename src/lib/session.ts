import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export function getSession() {
  return getServerSession(authOptions);
}

/** Returns the session or null; API routes use this to gate access. */
export async function requireUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  return session.user;
}
