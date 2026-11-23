
import Fastify from "fastify";
import cors from "@fastify/cors";

import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { env } from "./config/env.ts";
import { prisma } from "./lib/prisma.ts";

import { authRoutes } from "./routes/auth.ts";
import { ocorrenciasRoutes } from "./routes/ocorrencias.ts";
import { instituicoesRoutes } from "./routes/instituicoes.ts";
import { reconhecimentoRoutes } from "./routes/reconhecimento.ts";
import { guiasRoutes } from "./routes/guias.ts";

import { registerMultipart } from "./plugins/multipart.ts";
import { registerStatic } from "./plugins/static.ts";

const app = Fastify({
  logger: true,
  bodyLimit: 6 * 1024 * 1024,
});

// ==========================================
// CONFIGURAÇÃO DE CORS
// ==========================================

await app.register(cors, {
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  credentials: true,
  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],
});

// ==========================================
// CONFIGURAÇÃO DE UPLOADS
// ==========================================

const uploadsRoot = resolve(process.cwd(), "uploads");
const ocorrenciasUploadDir = resolve(uploadsRoot, "ocorrencias");

await mkdir(ocorrenciasUploadDir, { recursive: true });

registerMultipart(app);
registerStatic(app, uploadsRoot);

// ==========================================
// UTILITÁRIOS
// ==========================================

function isFileTooLargeError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "FST_REQ_FILE_TOO_LARGE"
  );
}

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/health", async () => ({
  status: "ok",
}));

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================

await app.register(authRoutes, {
  prefix: "/api/auth",
});

// ==========================================
// ROTAS DE OCORRÊNCIAS
// ==========================================

await app.register(ocorrenciasRoutes, {
  prefix: "/api/ocorrencias",
});

// ==========================================
// ROTAS DE INSTITUIÇÕES
// ==========================================

await app.register(instituicoesRoutes, {
  prefix: "/api/instituicoes",
});

// ==========================================
// ROTAS DE RECONHECIMENTO - SPECIESNET
// ==========================================

await app.register(reconhecimentoRoutes, {
  prefix: "/api/reconhecimento",
});

// ==========================================
// ROTAS DE GUIAS
// ==========================================

await app.register(guiasRoutes, {
  prefix: "/api/guias",
});

// ==========================================
// TRATAMENTO DE ERROS
// ==========================================

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);

  if (isFileTooLargeError(error)) {
    return reply.code(413).send({
      message: "O arquivo enviado ultrapassa o limite de 5 MB.",
    });
  }

  return reply.code(500).send({
    message: "Ocorreu um erro interno no servidor.",
  });
});

// ==========================================
// ENCERRAMENTO
// ==========================================

app.addHook("onClose", async () => {
  await prisma.$disconnect();
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================

try {
  await app.listen({
    host: env.host,
    port: env.port,
  });
} catch (error) {
  app.log.error(error);
  await app.close();
  process.exitCode = 1;
}