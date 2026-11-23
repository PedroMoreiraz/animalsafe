import {
  randomBytes,
  scrypt as callbackScrypt,
  timingSafeEqual,
} from "node:crypto";

import { prisma } from "../lib/prisma.ts";
import type { RegisterBody } from "../types/auth.ts";

const publicUserSelect = {
  id: true,
  username: true,
  primeiroNome: true,
  sobrenome: true,
  email: true,
} as const;

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    callbackScrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);

  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [algorithm, saltHex, keyHex] = storedHash.split("$");

  if (
    algorithm !== "scrypt" ||
    !saltHex ||
    !keyHex ||
    !/^[a-f0-9]{32}$/i.test(saltHex) ||
    !/^[a-f0-9]{128}$/i.test(keyHex)
  ) {
    return false;
  }

  const expectedKey = Buffer.from(keyHex, "hex");
  const actualKey = await deriveKey(password, Buffer.from(saltHex, "hex"));

  return timingSafeEqual(actualKey, expectedKey);
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function registerUser(data: RegisterBody) {
  const username = data.username.trim().toLowerCase();
  const primeiroNome = data.primeiroNome.trim();
  const sobrenome = data.sobrenome.trim();
  const email = data.email.trim().toLowerCase();
  const cpf = data.cpf.replace(/\D/g, "");
  const telefone = data.telefone.replace(/\D/g, "");

  if (
    cpf.length !== 11 ||
    telefone.length < 10 ||
    telefone.length > 11
  ) {
    throw new Error("INVALID_DOCUMENT_OR_PHONE");
  }

  if (!primeiroNome || !sobrenome) {
    throw new Error("INVALID_NAME");
  }

  const existingUser = await prisma.usuario.findFirst({
    where: {
      OR: [{ username }, { email }, { cpf }],
    },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  return prisma.usuario.create({
    data: {
      username,
      primeiroNome,
      sobrenome,
      email,
      cpf,
      telefone,
      senha: await hashPassword(data.senha),
    },
    select: publicUserSelect,
  });
}

export async function loginUser(identifier: string, senha: string) {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  const user = await prisma.usuario.findFirst({
    where: {
      OR: [
        { email: normalizedIdentifier },
        { username: normalizedIdentifier },
      ],
    },
  });

  if (!user || !(await verifyPassword(senha, user.senha))) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    primeiroNome: user.primeiroNome,
    sobrenome: user.sobrenome,
    email: user.email,
  };
}

export async function getPublicUser(userId: number) {
  return prisma.usuario.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });
}