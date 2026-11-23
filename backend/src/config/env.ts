import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;
const authSecret = process.env.AUTH_SECRET;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be configured.");
}

if (!authSecret || Buffer.byteLength(authSecret) < 32) {
  throw new Error("AUTH_SECRET must contain at least 32 bytes.");
}

const port = Number(process.env.PORT ?? 3001);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port.");
}

export const env = {
  databaseUrl,
  authSecret,
  speciesNetUrl: (
    process.env.SPECIESNET_API_URL ?? "http://127.0.0.1:8000"
  ).replace(/\/+$/, ""),
  port,
  host: process.env.HOST ?? "0.0.0.0",
  isProduction: process.env.NODE_ENV === "production",
};
