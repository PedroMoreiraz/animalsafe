
import { env } from "../config/env.ts";

export type ResultadoReconhecimento = {
  sucesso: true;
  resultado: unknown;
};

export type FalhaReconhecimento =
  | {
      sucesso: false;
      tipo: "api";
      status: number;
      resultado: unknown;
    }
  | {
      sucesso: false;
      tipo: "resposta_invalida";
    };

export async function reconhecerAnimal(
  buffer: Uint8Array,
  mimetype: string,
  filename: string,
): Promise<ResultadoReconhecimento | FalhaReconhecimento> {
  const formData = new FormData();

  formData.append(
    "foto",
    new Blob([Uint8Array.from(buffer)], {
      type: mimetype,
    }),
    filename || "imagem.jpg",
  );

  const resposta = await fetch(
    `${env.speciesNetUrl}/reconhecer`,
    {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(900000),
    },
  );

  const resultado: unknown = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    return {
      sucesso: false,
      tipo: "api",
      status: resposta.status,
      resultado,
    };
  }

  if (!resultado || typeof resultado !== "object") {
    return {
      sucesso: false,
      tipo: "resposta_invalida",
    };
  }

  return {
    sucesso: true,
    resultado,
  };
}
