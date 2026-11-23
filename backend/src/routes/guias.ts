
import type { FastifyInstance } from "fastify";

import {
  buscarGuia,
  buscarGuiaRecomendado,
  listarGuias,
} from "../services/guias.service.ts";

type FiltrosGuiasQuery = {
  situacao?: string;
  grupo_animal?: string;
};

type RecomendacaoQuery = {
  origem_animal?: string;
  situacao?: string;
  descricao?: string;
};

export async function guiasRoutes(app: FastifyInstance) {
  // RECOMENDAÇÃO DE GUIA PARA UMA OCORRÊNCIA
  // Esta rota precisa ficar antes de /:id.
  app.get<{ Querystring: RecomendacaoQuery }>(
    "/recomendacao",
    async (request, reply) => {
      const origemAnimal = request.query.origem_animal?.trim();
      const situacao = request.query.situacao?.trim();
      const descricao = request.query.descricao?.trim() ?? "";

      if (!origemAnimal || !situacao) {
        return reply.code(400).send({
          message: "Informe a origem e a situação do animal.",
        });
      }

      const origensPermitidas = [
        "Silvestre",
        "Doméstico",
        "Não sei identificar",
      ];

      if (!origensPermitidas.includes(origemAnimal)) {
        return reply.code(400).send({
          message: "Origem do animal inválida.",
        });
      }

      const guia = await buscarGuiaRecomendado({
        origem_animal: origemAnimal,
        situacao,
        descricao,
      });

      return reply.send({
        guia,
        encontrado: Boolean(guia),
      });
    },
  );

  // LISTAGEM DE GUIAS
  app.get<{ Querystring: FiltrosGuiasQuery }>(
    "/",
    async (request, reply) => {
      const { situacao, grupo_animal } = request.query;

      const filtros = {
        ...(situacao?.trim() && {
          situacao: situacao.trim(),
        }),
        ...(grupo_animal?.trim() && {
          grupo_animal: grupo_animal.trim(),
        }),
      };

      const guias = await listarGuias(filtros);

      return reply.send({
        total: guias.length,
        guias,
      });
    },
  );

  // BUSCA DE UM GUIA PELO ID
  app.get<{ Params: { id: string } }>(
    "/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return reply.code(400).send({
          message: "Identificador do guia inválido.",
        });
      }

      const guia = await buscarGuia(id);

      if (!guia) {
        return reply.code(404).send({
          message: "Guia de orientação não encontrado.",
        });
      }

      return reply.send(guia);
    },
  );
}