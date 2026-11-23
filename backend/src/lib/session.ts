import { createHmac, timingSafeEqual } from "node:crypto";

import type { FastifyReply, FastifyRequest } from "fastify";

import { env } from "../config/env.ts";
import { prisma } from "./prisma.ts";
import type { SessionPayload } from "../types/auth.ts";

const sessionCookieName = "animalsafe_session";
const sessionDurationSeconds = 60 * 60 * 24 * 7;

export function createSessionToken(userId: number): string {
  const payload: SessionPayload = {
    userId,
    expiresAt: Date.now() + sessionDurationSeconds * 1000,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );

  const signature = createHmac("sha256", env.authSecret)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function readSessionToken(token: string | undefined): number | null {
  if (!token) return null;

  const [encodedPayload, signature, extraPart] = token.split(".");

  if (!encodedPayload || !signature || extraPart !== undefined) {
    return null;
  }

  const expectedSignature = createHmac("sha256", env.authSecret)
    .update(encodedPayload)
    .digest();

  let actualSignature: Buffer;

  try {
    actualSignature = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }

  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;

    if (
      typeof payload.userId !== "number" ||
      !Number.isSafeInteger(payload.userId) ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return payload.userId;
  } catch {
    return null;
  }
}

export function getSessionToken(
  request: FastifyRequest,
): string | undefined {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) return undefined;

  const cookiePrefix = `${sessionCookieName}=`;

  const sessionCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(cookiePrefix));

  return sessionCookie?.slice(cookiePrefix.length);
}

export function setSessionCookie(
  reply: FastifyReply,
  userId: number,
): void {
  const secure = env.isProduction ? "; Secure" : "";

  reply.header(
    "Set-Cookie",
    `${sessionCookieName}=${createSessionToken(userId)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${sessionDurationSeconds}${secure}`,
  );
}

export function clearSessionCookie(reply: FastifyReply): void {
  const secure = env.isProduction ? "; Secure" : "";

  reply.header(
    "Set-Cookie",
    `${sessionCookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`,
  );
}

export async function getAuthenticatedUserId(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<number | null> {
  const userId = readSessionToken(getSessionToken(request));

  if (!userId) {
    reply.code(401).send({
      message: "Sessão inválida ou expirada.",
    });

    return null;
  }

  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    clearSessionCookie(reply);

    reply.code(401).send({
      message: "Sessão inválida ou expirada.",
    });

    return null;
  }

  return userId;
}