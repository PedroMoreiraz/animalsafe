
import type { FastifyPluginAsync } from "fastify";

import { listarInstituicoes } from "../services/instituicoes.service.ts";

const estadosValidos = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF",
  "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS",
  "RO", "RR", "SC", "SP", "SE", "TO",
];

export const instituicoesRoutes: FastifyPluginAsync = async (app) => {
  app.get<{
    Querystring: {
      uf?: string;
      categoria?: string;
      busca?: string;
    };
  }>("/", async (request, reply) => {
    try {
      const uf = request.query.uf?.trim().toUpperCase();
      const categoria = request.query.categoria?.trim();
      const busca = request.query.busca?.trim();

      if (uf && !estadosValidos.includes(uf)) {
        return reply.code(400).send({
          message: "UF inválida.",
        });
      }

      const instituicoes = await listarInstituicoes({
        uf,
        categoria,
        busca,
      });

      return reply.send({
        instituicoes,
      });
    } catch (error) {
      request.log.error(error);

      return reply.code(500).send({
        message: "Erro ao buscar instituições.",
      });
    }
  });
};
