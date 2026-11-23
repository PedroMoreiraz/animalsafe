
import type { FastifyPluginAsync } from "fastify";

import { getAuthenticatedUserId } from "../lib/session.ts";
import { reconhecerAnimal } from "../services/reconhecimento.service.ts";

function isFileTooLargeError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "FST_REQ_FILE_TOO_LARGE"
  );
}

const tiposPermitidos = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const reconhecimentoRoutes: FastifyPluginAsync = async (app) => {
  app.post("/", async (request, reply) => {
    const userId = await getAuthenticatedUserId(request, reply);

    if (!userId) return;

    try {
      const arquivo = await request.file();

      if (!arquivo) {
        return reply.code(400).send({
          message: "Envie uma fotografia para reconhecimento.",
        });
      }

      if (arquivo.fieldname !== "foto") {
        arquivo.file.resume();

        return reply.code(400).send({
          message: 'O arquivo deve ser enviado no campo "foto".',
        });
      }

      if (!tiposPermitidos.includes(arquivo.mimetype)) {
        arquivo.file.resume();

        return reply.code(400).send({
          message: "Formato inválido. Envie JPG, PNG ou WEBP.",
        });
      }

      const buffer = await arquivo.toBuffer();

      if (arquivo.file.truncated) {
        return reply.code(413).send({
          message: "A imagem deve ter no máximo 5 MB.",
        });
      }

      if (buffer.length === 0) {
        return reply.code(400).send({
          message: "A imagem enviada está vazia.",
        });
      }

      request.log.info(
        "Enviando imagem para reconhecimento SpeciesNet.",
      );

      const resposta = await reconhecerAnimal(
        buffer,
        arquivo.mimetype,
        arquivo.filename || "imagem.jpg",
      );

      if (!resposta.sucesso) {
        if (resposta.tipo === "api") {
          request.log.error(
            {
              status: resposta.status,
              resultado: resposta.resultado,
            },
            "A API SpeciesNet retornou um erro.",
          );

          return reply.code(502).send({
            message: "Não foi possível reconhecer o animal.",
          });
        }

        request.log.error(
          "A API SpeciesNet retornou uma resposta inválida.",
        );

        return reply.code(502).send({
          message:
            "O serviço de reconhecimento retornou uma resposta inválida.",
        });
      }

      return reply.send(resposta.resultado);
    } catch (error) {
      if (isFileTooLargeError(error)) {
        return reply.code(413).send({
          message: "A imagem deve ter no máximo 5 MB.",
        });
      }

      request.log.error(
        error,
        "Erro ao realizar reconhecimento com SpeciesNet.",
      );

      return reply.code(503).send({
        message:
          "Serviço de reconhecimento indisponível. Verifique se a API SpeciesNet está em execução.",
      });
    }
  });
};
