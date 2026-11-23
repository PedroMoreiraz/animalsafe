
import { prisma } from "../lib/prisma.ts";

type FiltrosGuias = {
  situacao?: string;
  grupo_animal?: string;
};

type DadosRecomendacao = {
  origem_animal: string;
  situacao: string;
  descricao?: string;
};

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function listarGuias(filtros: FiltrosGuias = {}) {
  return prisma.guiaOrientacao.findMany({
    where: {
      ativo: true,
      ...(filtros.situacao && {
        situacao: {
          equals: filtros.situacao,
          mode: "insensitive",
        },
      }),
      ...(filtros.grupo_animal && {
        grupo_animal: {
          equals: filtros.grupo_animal,
          mode: "insensitive",
        },
      }),
    },
    orderBy: [
      { nivel_risco: "desc" },
      { titulo: "asc" },
    ],
  });
}

export async function buscarGuia(id: number) {
  return prisma.guiaOrientacao.findFirst({
    where: {
      id,
      ativo: true,
    },
  });
}

/**
 * Seleciona somente guias compatíveis com a situação registrada.
 * Quando não existe correspondência segura, retorna null.
 */
export async function buscarGuiaRecomendado(
  dados: DadosRecomendacao,
) {
  const origem = normalizar(dados.origem_animal);
  const situacao = normalizar(dados.situacao);
  const descricao = normalizar(dados.descricao ?? "");

  let situacaoGuia: string | null = null;
  let grupoAnimal: string | null = null;

  if (origem === "silvestre") {
    grupoAnimal = "Silvestre";

    if (situacao === "animal ferido") {
      situacaoGuia = "Animal silvestre ferido ou debilitado";
    }

    if (situacao === "animal em situacao de risco") {
      situacaoGuia = "Animal silvestre em situação de risco";
    }

    if (
      situacao === "animal abandonado" &&
      /\b(filhote|filhotes|sozinho|sozinha|ninho)\b/.test(descricao)
    ) {
      situacaoGuia = "Filhote encontrado sozinho";
    }
  }

  if (origem === "domestico") {
    grupoAnimal = "Doméstico";

    if (situacao === "animal abandonado") {
      situacaoGuia =
        "Animal doméstico em possível situação de maus-tratos";
    }

    if (
      /\b(maus.tratos|agressao|agredido|violencia|negligencia|abuso)\b/.test(
        descricao,
      )
    ) {
      situacaoGuia =
        "Animal doméstico em possível situação de maus-tratos";
    }
  }

  if (!situacaoGuia || !grupoAnimal) {
    return null;
  }

  return prisma.guiaOrientacao.findFirst({
    where: {
      ativo: true,
      grupo_animal: {
        equals: grupoAnimal,
        mode: "insensitive",
      },
      situacao: {
        equals: situacaoGuia,
        mode: "insensitive",
      },
    },
  });
}