import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizePhone, verifyOtp } from "@/lib/otp";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    id: "credentials",
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) return null;
      const user = await prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase().trim() },
      });
      if (!user?.passwordHash) return null;
      const valid = await compare(credentials.password, user.passwordHash);
      if (!valid) return null;
      return { id: user.id, name: user.name, email: user.email, image: user.image };
    },
  }),
  CredentialsProvider({
    id: "phone-otp",
    name: "Phone",
    credentials: {
      phone: { label: "Phone", type: "tel" },
      code: { label: "Code", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.phone || !credentials.code) return null;
      const phone = normalizePhone(credentials.phone);
      const valid = await verifyOtp(phone, credentials.code.trim());
      if (!valid) return null;
      // Sign in the existing owner of this number, or create a customer account.
      let user = await prisma.user.findFirst({ where: { phone } });
      if (!user) {
        user = await prisma.user.create({
          data: { name: "მომხმარებელი", phone, role: "CUSTOMER" },
        });
      }
      return { id: user.id, name: user.name, email: user.email, image: user.image };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account }) {
      // Google users are upserted on first sign-in (JWT sessions, no adapter).
      if (account?.provider === "google" && user.email) {
        await prisma.user.upsert({
          where: { email: user.email.toLowerCase() },
          update: { name: user.name ?? undefined, image: user.image ?? undefined },
          create: {
            email: user.email.toLowerCase(),
            name: user.name ?? "მომხმარებელი",
            image: user.image,
          },
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      // Phone-only accounts have no email — resolve those by user id instead.
      const select = { id: true, role: true, masterProfile: { select: { id: true } } };
      const id = (user?.id as string | undefined) ?? (token.uid as string | undefined);
      const dbUser = token.email
        ? await prisma.user.findUnique({ where: { email: token.email.toLowerCase() }, select })
        : id
          ? await prisma.user.findUnique({ where: { id }, select })
          : null;
      if (dbUser) {
        token.uid = dbUser.id;
        token.role = dbUser.role;
        token.masterId = dbUser.masterProfile?.id ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? "";
        session.user.role = (token.role as string) ?? "CUSTOMER";
        session.user.masterId = (token.masterId as string | null) ?? null;
      }
      return session;
    },
  },
};
