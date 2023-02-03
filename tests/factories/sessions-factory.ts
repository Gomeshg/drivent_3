import { Session } from "@prisma/client";
import { createUser } from "./users-factory";
import { prisma } from "@/config";

export async function createSession(token: string, userId?: number): Promise<Session> {
  let user;
  if (!userId) {
    user = await createUser();
  }
  const userID = userId || user.id;

  return prisma.session.create({
    data: {
      token: token,
      userId: userID,
    },
  });
}
