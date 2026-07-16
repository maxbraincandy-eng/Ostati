import { prisma } from "@/lib/prisma";

export function notify(userId: string, title: string, body = "", href = "") {
  return prisma.notification.create({ data: { userId, title, body, href } });
}
