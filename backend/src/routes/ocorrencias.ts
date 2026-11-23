
import type { FastifyPluginAsync } from "fastify";

import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { pipeline } from "node:stream/promises";

import { getAuthenticatedUserId } from "../lib/session.ts";

import {
  buscarOcorrencia,
  criarOcorrencia,
  listarOcorrencias,
} from "../services/ocorrencias.service.ts";

const ocorrenciasUploadDir = resolve(
  process.cwd(),
  "uploads",
  "ocorrencias",
);

const extensoesPermitidas: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const origensPermitidas = [
  "Silvestre",
  "Doméstico",
  "Não sei identificar",
] as const;

function isFileTooLargeError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "FST_REQ_FILE_TOO_LARGE"
  );
}

async function removerArquivo(
  filePath: string | null,
): Promise<void> {
  if (filePath) {
    await unlink(filePath).catch(() => {});
  }
}

export const ocorrenciasRoutes: FastifyPluginAsync = async (app) => {
  await mkdir(ocorrenciasUploadDir, { recursive: true });

  // LISTAGEM DE OCORRÊNCIAS
  app.get("/", async (request, reply) => {
    const usuarioId = await getAuthenticatedUserId(request, reply);

    if (!usuarioId) return;

    const ocorrencias = await listarOcorrencias(usuarioId);

    return reply.send({ ocorrencias });
  });

  // DETALHES DE UMA OCORRÊNCIA
  app.get<{ Params: { id: string } }>(
    "/:id",
    async (request, reply) => {
      const usuarioId = await getAuthenticatedUserId(request, reply);

      if (!usuarioId) return;

      const ocorrenciaId = Number(request.params.id);

      if (
        !Number.isSafeInteger(ocorrenciaId) ||
        ocorrenciaId <= 0
      ) {
        return reply.code(400).send({
          message: "Identificador de ocorrência inválido.",
        });
      }

      const ocorrencia = await buscarOcorrencia(
        ocorrenciaId,
        usuarioId,
      );

      if (!ocorrencia) {
        return reply.code(404).send({
          message: "Ocorrência não encontrada.",
        });
      }

      return reply.send({ ocorrencia });
    },
  );

  // CADASTRO DE OCORRÊNCIA
  app.post("/", async (request, reply) => {
    const usuarioId = await getAuthenticatedUserId(request, reply);

    if (!usuarioId) return;

    const campos: Record<string, string> = {};

    let savedFilePath: string | null = null;
    let fotoUrl: string | null = null;

    try {
      for await (const part of request.parts()) {
        if (part.type === "file") {
          if (part.fieldname !== "foto") {
            part.file.resume();

            await removerArquivo(savedFilePath);
            savedFilePath = null;

            return reply.code(400).send({
              message: "Campo de arquivo inválido.",
            });
          }

          const extensao = extensoesPermitidas[part.mimetype];

          if (!extensao) {
            part.file.resume();

            await removerArquivo(savedFilePath);
            savedFilePath = null;

            return reply.code(400).send({
              message:
                "Formato de imagem inválido. Utilize JPG, PNG ou WEBP.",
            });
          }

          const nomeArquivo = `${randomUUID()}${extensao}`;

          savedFilePath = resolve(
            ocorrenciasUploadDir,
            nomeArquivo,
          );

          await pipeline(
            part.file,
            createWriteStream(savedFilePath),
          );

          if (part.file.truncated) {
            await removerArquivo(savedFilePath);
            savedFilePath = null;

            return reply.code(413).send({
              message: "A imagem deve ter no máximo 5 MB.",
            });
          }

          fotoUrl = `/uploads/ocorrencias/${nomeArquivo}`;
        } else {
          campos[part.fieldname] = String(part.value);
        }
      }

      const tipoAnimal = campos.tipo_animal?.trim();
      const origemAnimal = campos.origem_animal?.trim();
      const situacao = campos.situacao?.trim();
      const descricao = campos.descricao?.trim();

      const latitude = Number(campos.latitude);
      const longitude = Number(campos.longitude);

      if (!tipoAnimal || !origemAnimal || !situacao || !descricao) {
        await removerArquivo(savedFilePath);
        savedFilePath = null;

        return reply.code(400).send({
          message:
            "Preencha o tipo, a origem, a situação e a descrição do animal.",
        });
      }

      if (
        !origensPermitidas.includes(
          origemAnimal as (typeof origensPermitidas)[number],
        )
      ) {
        await removerArquivo(savedFilePath);
        savedFilePath = null;

        return reply.code(400).send({
          message: "Origem do animal inválida.",
        });
      }

      if (descricao.length > 1000) {
        await removerArquivo(savedFilePath);
        savedFilePath = null;

        return reply.code(400).send({
          message: "A descrição deve ter no máximo 1000 caracteres.",
        });
      }

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        await removerArquivo(savedFilePath);
        savedFilePath = null;

        return reply.code(400).send({
          message:
            "Localização inválida. Informe novamente sua localização.",
        });
      }

      const ocorrencia = await criarOcorrencia({
        usuarioId,
        tipo_animal: tipoAnimal,
        origem_animal: origemAnimal,
        situacao,
        descricao,
        latitude,
        longitude,
        foto_url: fotoUrl,
      });

      return reply.code(201).send({
        message: "Ocorrência registrada com sucesso.",
        ocorrencia,
      });
    } catch (error) {
      await removerArquivo(savedFilePath);

      if (isFileTooLargeError(error)) {
        return reply.code(413).send({
          message: "A imagem deve ter no máximo 5 MB.",
        });
      }

      throw error;
    }
  });
};