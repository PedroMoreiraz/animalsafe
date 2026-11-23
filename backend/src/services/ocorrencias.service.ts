
import { prisma } from "../lib/prisma.ts";

type NovaOcorrencia = {
  usuarioId: number;
  tipo_animal: string;
  origem_animal: string;
  situacao: string;
  descricao: string;
  latitude: number;
  longitude: number;
  foto_url: string | null;
};

export async function listarOcorrencias(usuarioId: number) {
  return prisma.ocorrencia.findMany({
    where: {
      usuarioId,
    },
    orderBy: {
      data_registro: "desc",
    },
    include: {
      usuario: {
        select: {
          id: true,
          username: true,
          primeiroNome: true,
          sobrenome: true,
        },
      },
    },
  });
}

export async function buscarOcorrencia(
  ocorrenciaId: number,
  usuarioId: number,
) {
  return prisma.ocorrencia.findFirst({
    where: {
      id: ocorrenciaId,
      usuarioId,
    },
    include: {
      usuario: {
        select: {
          id: true,
          username: true,
          primeiroNome: true,
          sobrenome: true,
        },
      },
    },
  });
}

export async function criarOcorrencia(dados: NovaOcorrencia) {
  return prisma.ocorrencia.create({
    data: {
      usuarioId: dados.usuarioId,
      tipo_animal: dados.tipo_animal,
      origem_animal: dados.origem_animal,
      situacao: dados.situacao,
      descricao: dados.descricao,
      latitude: dados.latitude,
      longitude: dados.longitude,
      foto_url: dados.foto_url,
    },
  });
}