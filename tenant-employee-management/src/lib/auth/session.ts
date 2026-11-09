import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/redis";

const COOKIE = process.env.SESSION_COOKIE_NAME ?? "ems_session";
const TTL = Number(process.env.SESSION_TTL_SECONDS ?? "604800");
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hash(token);
  const expiresAt = new Date(Date.now() + TTL * 1000);

  const record = await prisma.userSession.create({
    data: { userId, tokenHash, expiresAt }
  });

  try {
    await redis.set(
      `session:${tokenHash}`,
      JSON.stringify({ userId, sessionId: record.id }),
      "EX",
      TTL
    );
  } catch (error) {
    await prisma.userSession.delete({ where: { id: record.id } });
    throw new Error("Session service unavailable", { cause: error });
  }

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt
  });
}

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;

  const tokenHash = hash(token);
  let cached: string | null;

  try {
    cached = await redis.get(`session:${tokenHash}`);
  } catch (error) {
    // Fail closed. Do not silently bypass a failed session store.
    throw new Error("Authentication service unavailable", { cause: error });
  }

  let sessionId: string | undefined;
  let userId: string | undefined;

  if (cached) {
    try {
      const parsed = JSON.parse(cached) as { sessionId: string; userId: string };
      sessionId = parsed.sessionId;
      userId = parsed.userId;
    } catch {
      await redis.del(`session:${tokenHash}`);
      return null;
    }
  }

  const session = await prisma.userSession.findFirst({
    where: {
      tokenHash,
      ...(sessionId ? { id: sessionId } : {}),
      ...(userId ? { userId } : {}),
      revokedAt: null,
      expiresAt: { gt: new Date() },
      user: { isActive: true }
    },
    select: { id: true, user: { select: { id: true, email: true } } }
  });

  if (!session) {
    await redis.del(`session:${tokenHash}`);
    return null;
  }

  if (!cached) {
    const remaining = Math.max(
      1,
      Math.floor((await prisma.userSession.findUniqueOrThrow({
        where: { id: session.id }, select: { expiresAt: true }
      })).expiresAt.getTime() - Date.now()) / 1000
    );
    await redis.set(
      `session:${tokenHash}`,
      JSON.stringify({ userId: session.user.id, sessionId: session.id }),
      "EX",
      Math.floor(remaining)
    );
  }

  return session.user;
}

export async function revokeCurrentSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token && /^[a-f0-9]{64}$/.test(token)) {
    const tokenHash = hash(token);
    await prisma.userSession.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    await redis.del(`session:${tokenHash}`);
  }
  store.delete(COOKIE);
}
