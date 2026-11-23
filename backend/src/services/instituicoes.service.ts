
import { prisma } from "../lib/prisma.ts";

type FiltrosInstituicoes = {
  uf?: string;
  categoria?: string;
  busca?: string;
};

export async function listarInstituicoes({
  uf,
  categoria,
  busca,
}: FiltrosInstituicoes) {
  return prisma.instituicao.findMany({
    where: {
      AND: [
        ...(uf
          ? [
              {
                OR: [
                  { abrangencia: "Nacional" },
                  { uf },
                ],
              },
            ]
          : []),

        ...(categoria
          ? [
              {
                categoria: {
                  contains: categoria,
                  mode: "insensitive" as const,
                },
              },
            ]
          : []),

        ...(busca
          ? [
              {
                OR: [
                  {
                    nome: {
                      contains: busca,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    categoria: {
                      contains: busca,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    descricao: {
                      contains: busca,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    },
    orderBy: {
      nome: "asc",
    },
    select: {
      id: true,
      nome: true,
      categoria: true,
      descricao: true,
      abrangencia: true,
      uf: true,
      telefone: true,
      email: true,
      endereco: true,
      site: true,
    },
  });
}
