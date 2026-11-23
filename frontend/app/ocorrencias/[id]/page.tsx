
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  PawPrint,
  RefreshCw,
  AlertCircle,
  UserRound,
  ImageOff,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Info,
  BookOpen,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Ocorrencia = {
  id: number;
  usuarioId: number;
  tipo_animal: string;
  origem_animal: string | null;
  situacao: string;
  descricao: string;
  latitude: number;
  longitude: number;
  foto_url: string | null;
  data_registro: string;
  usuario: {
    id: number;
    username: string;
    primeiroNome: string;
    sobrenome: string;
  };
};

type GuiaOrientacao = {
  id: number;
  titulo: string;
  descricao: string;
  situacao: string;
  grupo_animal: string;
  nivel_risco: string;
  o_que_fazer: string[];
  o_que_evitar: string[];
  quando_pedir_ajuda: string;
  fonte: string;
  url_fonte: string | null;
};

function formatarData(data: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data));
}

function obterUrlFoto(fotoUrl: string | null) {
  if (!fotoUrl) return null;

  if (fotoUrl.startsWith("http")) return fotoUrl;

  return `${API_URL}${fotoUrl}`;
}

function obterCorRisco(risco: string) {
  const nivel = risco.toLowerCase();

  if (nivel === "alto") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (nivel === "moderado") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-green-200 bg-green-50 text-green-700";
}

export default function DetalhesOcorrenciaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [ocorrencia, setOcorrencia] = useState<Ocorrencia | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [guia, setGuia] = useState<GuiaOrientacao | null>(null);
  const [carregandoGuia, setCarregandoGuia] = useState(false);
  const [erroGuia, setErroGuia] = useState("");

  const carregarOcorrencia = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(
        `/api/ocorrencias/${encodeURIComponent(params.id)}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      const resultado = await resposta.json().catch(() => null);

      if (resposta.status === 401) {
        router.push("/login");
        return;
      }

      if (!resposta.ok) {
        throw new Error(
          resultado?.message ?? "Não foi possível carregar a ocorrência.",
        );
      }

      setOcorrencia(resultado.ocorrencia);
    } catch (error) {
      console.error(error);

      setErro(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao consultar a ocorrência.",
      );
    } finally {
      setCarregando(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    carregarOcorrencia();
  }, [carregarOcorrencia]);

  // BUSCAR GUIA DE ORIENTAÇÃO COMPATÍVEL COM A OCORRÊNCIA
  useEffect(() => {
    if (!ocorrencia) return;

    let cancelado = false;

    async function carregarGuia() {
      setCarregandoGuia(true);
      setErroGuia("");
      setGuia(null);

      try {
        const parametros = new URLSearchParams({
          origem_animal:
            ocorrencia.origem_animal || "Não sei identificar",
          situacao: ocorrencia.situacao,
          descricao: ocorrencia.descricao,
        });

        const resposta = await fetch(
          `${API_URL}/api/guias/recomendacao?${parametros.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const resultado = await resposta.json().catch(() => null);

        if (!resposta.ok) {
          throw new Error(
            resultado?.message ??
              "Não foi possível consultar as orientações.",
          );
        }

        if (!cancelado) {
          setGuia(resultado?.guia ?? null);
        }
      } catch (error) {
        console.error("Erro ao carregar guia:", error);

        if (!cancelado) {
          setErroGuia(
            error instanceof Error
              ? error.message
              : "Ocorreu um erro ao consultar as orientações.",
          );
        }
      } finally {
        if (!cancelado) {
          setCarregandoGuia(false);
        }
      }
    }

    carregarGuia();

    return () => {
      cancelado = true;
    };
  }, [ocorrencia]);

  const foto = ocorrencia
    ? obterUrlFoto(ocorrencia.foto_url)
    : null;

  const urlMapa = ocorrencia
    ? `https://www.google.com/maps?q=${ocorrencia.latitude},${ocorrencia.longitude}`
    : "";

  return (
    <main className="min-h-screen bg-[#f8faf8] pb-28">
      <header className="border-b border-[#e6ece7] bg-white">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <Link
            href="/ocorrencias"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#718078] transition hover:text-[#247253]"
          >
            <ArrowLeft size={17} />
            Voltar para ocorrências
          </Link>

          <p className="mt-5 text-sm font-medium text-[#247253]">
            ANIMAL SAFETY
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#17352b]">
            Detalhes da ocorrência
          </h1>

          <p className="mt-1 text-sm text-[#718078]">
            Informações sobre o animal e a situação registrada.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6">
        {carregando && (
          <div className="mt-8 flex flex-col items-center rounded-3xl border border-[#e2eae4] bg-white px-6 py-20 text-center">
            <RefreshCw
              size={30}
              className="animate-spin text-[#247253]"
            />

            <p className="mt-5 text-sm font-medium text-[#17352b]">
              Carregando ocorrência...
            </p>
          </div>
        )}

        {!carregando && erro && (
          <div className="mt-8 flex flex-col items-center rounded-3xl border border-red-100 bg-white px-6 py-16 text-center">
            <AlertCircle size={32} className="text-red-500" />

            <h2 className="mt-5 text-lg font-semibold text-[#17352b]">
              Não foi possível carregar
            </h2>

            <p className="mt-2 text-sm text-[#718078]">{erro}</p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={carregarOcorrencia}
                className="rounded-full bg-[#247253] px-6 py-3 text-sm font-semibold text-white"
              >
                Tentar novamente
              </button>

              <Link
                href="/ocorrencias"
                className="rounded-full border border-[#d6e2d9] px-6 py-3 text-sm font-semibold text-[#247253]"
              >
                Voltar
              </Link>
            </div>
          </div>
        )}

        {!carregando && !erro && ocorrencia && (
          <>
            {/* FOTO E DESCRIÇÃO */}
            <section className="mt-8 overflow-hidden rounded-3xl border border-[#e2eae4] bg-white">
              <div className="flex min-h-64 items-center justify-center bg-[#f2f6f2] sm:min-h-96">
                {foto ? (
                  <img
                    src={foto}
                    alt={`Foto do animal: ${ocorrencia.tipo_animal}`}
                    className="max-h-[520px] w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-[#9aaa9f]">
                    <ImageOff size={42} strokeWidth={1.4} />
                    <p className="text-sm">
                      Nenhuma fotografia foi enviada
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex justify-end">
                  <span className="text-xs text-[#9aaa9f]">
                    Ocorrência #{ocorrencia.id}
                  </span>
                </div>

                <h2 className="mt-5 text-2xl font-semibold text-[#17352b]">
                  {ocorrencia.tipo_animal}
                </h2>

                <p className="mt-2 text-base font-medium text-[#247253]">
                  {ocorrencia.situacao}
                </p>

                <div className="mt-7 border-t border-[#edf1ed] pt-6">
                  <h3 className="text-sm font-semibold text-[#17352b]">
                    Descrição da ocorrência
                  </h3>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#718078]">
                    {ocorrencia.descricao}
                  </p>
                </div>
              </div>
            </section>

            {/* INFORMAÇÕES DO REGISTRO */}
            <section className="mt-6 rounded-3xl border border-[#e2eae4] bg-white p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-[#17352b]">
                Informações do registro
              </h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eaf5ee] text-[#247253]">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-[#9aaa9f]">
                      Data do registro
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#17352b]">
                      {formatarData(ocorrencia.data_registro)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eaf5ee] text-[#247253]">
                    <UserRound size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-[#9aaa9f]">
                      Registrado por
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#17352b]">
                      {ocorrencia.usuario.primeiroNome}{" "}
                      {ocorrencia.usuario.sobrenome}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eaf5ee] text-[#247253]">
                    <PawPrint size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-[#9aaa9f]">
                      Tipo de animal
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#17352b]">
                      {ocorrencia.tipo_animal}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eaf5ee] text-[#247253]">
                    <Info size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-[#9aaa9f]">
                      Origem do animal
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#17352b]">
                      {ocorrencia.origem_animal || "Não identificada"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eaf5ee] text-[#247253]">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-[#9aaa9f]">
                      Coordenadas registradas
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#17352b]">
                      {ocorrencia.latitude.toFixed(5)},{" "}
                      {ocorrencia.longitude.toFixed(5)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ORIENTAÇÕES: O QUE FAZER */}
            <section className="mt-6 overflow-hidden rounded-3xl border border-[#dce9df] bg-white">
              <div className="border-b border-[#e8eee9] bg-[#f0f7f1] p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#247253] text-white">
                    <BookOpen size={21} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold tracking-wide text-[#247253]">
                      ORIENTAÇÃO AO USUÁRIO
                    </p>

                    <h2 className="mt-1 text-xl font-semibold text-[#17352b]">
                      O que fazer?
                    </h2>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#718078]">
                  Com base nas informações registradas, apresentamos
                  orientações para ajudar você a agir com segurança.
                </p>
              </div>

              <div className="p-6 sm:p-8">
                {carregandoGuia && (
                  <div className="flex items-center gap-3 py-8">
                    <RefreshCw
                      size={21}
                      className="animate-spin text-[#247253]"
                    />

                    <p className="text-sm text-[#718078]">
                      Buscando orientações adequadas para esta situação...
                    </p>
                  </div>
                )}

                {!carregandoGuia && erroGuia && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={21}
                        className="mt-0.5 shrink-0 text-amber-700"
                      />

                      <div>
                        <h3 className="text-sm font-semibold text-amber-900">
                          Não foi possível carregar o guia
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-amber-800">
                          {erroGuia}
                        </p>

                        <p className="mt-2 text-xs leading-5 text-amber-800">
                          As orientações gerais de segurança continuam
                          disponíveis abaixo.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!carregandoGuia && guia && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="rounded-full bg-[#eaf5ee] px-3 py-1.5 text-xs font-semibold text-[#247253]">
                        {guia.grupo_animal}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${obterCorRisco(guia.nivel_risco)}`}
                      >
                        Risco {guia.nivel_risco}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-semibold text-[#17352b]">
                      {guia.titulo}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-[#718078]">
                      {guia.descricao}
                    </p>

                    {/* O QUE FAZER */}
                    <div className="mt-8">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          size={21}
                          className="text-[#247253]"
                        />

                        <h3 className="text-base font-semibold text-[#17352b]">
                          O que fazer
                        </h3>
                      </div>

                      <div className="mt-4 space-y-3">
                        {guia.o_que_fazer.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 rounded-2xl bg-[#f5f8f5] p-4"
                          >
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#e0eee4] text-xs font-bold text-[#247253]">
                              {index + 1}
                            </span>

                            <p className="pt-1 text-sm leading-6 text-[#52665b]">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* O QUE EVITAR */}
                    {guia.o_que_evitar.length > 0 && (
                      <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5">
                        <div className="flex items-center gap-2">
                          <XCircle
                            size={21}
                            className="text-red-600"
                          />

                          <h3 className="text-base font-semibold text-red-800">
                            O que evitar
                          </h3>
                        </div>

                        <ul className="mt-4 space-y-3">
                          {guia.o_que_evitar.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm leading-6 text-red-800"
                            >
                              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-red-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* QUANDO PEDIR AJUDA */}
                    <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                      <div className="flex items-center gap-2">
                        <ShieldAlert
                          size={21}
                          className="text-amber-700"
                        />

                        <h3 className="text-base font-semibold text-amber-900">
                          Quando pedir ajuda?
                        </h3>
                      </div>

                      <p className="mt-3 text-sm leading-7 text-amber-900">
                        {guia.quando_pedir_ajuda}
                      </p>
                    </div>

                    {/* FONTE */}
                    <div className="mt-8 border-t border-[#edf1ed] pt-5">
                      <p className="text-xs font-semibold text-[#9aaa9f]">
                        FONTE DA ORIENTAÇÃO
                      </p>

                      <p className="mt-2 text-sm font-medium text-[#52665b]">
                        {guia.fonte}
                      </p>

                      {guia.url_fonte && (
                        <a
                          href={guia.url_fonte}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#247253] transition hover:text-[#17352b]"
                        >
                          Consultar fonte
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* ORIENTAÇÃO GERAL QUANDO NÃO EXISTE GUIA */}
                {!carregandoGuia && !guia && (
                  <div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                      <div className="flex items-start gap-3">
                        <Info
                          size={22}
                          className="mt-0.5 shrink-0 text-blue-700"
                        />

                        <div>
                          <h3 className="text-sm font-semibold text-blue-900">
                            Não encontramos um guia específico
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-blue-800">
                            Não há uma orientação cadastrada que corresponda
                            exatamente às informações desta ocorrência.
                            Por segurança, siga estas recomendações gerais
                            enquanto busca ajuda especializada.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-base font-semibold text-[#17352b]">
                        Recomendações gerais
                      </h3>

                      <div className="mt-4 space-y-3">
                        {[
                          "Mantenha uma distância segura do animal e observe a situação sem se aproximar.",
                          "Evite tocar, capturar, perseguir ou encurralar o animal.",
                          "Não ofereça medicamentos, alimentos ou tratamentos sem orientação profissional.",
                          "Mantenha crianças e outros animais domésticos afastados.",
                          "Entre em contato com o órgão responsável ou com um profissional habilitado para receber orientação.",
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 rounded-2xl bg-[#f5f8f5] p-4"
                          >
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#e0eee4] text-xs font-bold text-[#247253]">
                              {index + 1}
                            </span>

                            <p className="pt-1 text-sm leading-6 text-[#52665b]">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* LOCALIZAÇÃO */}
            <section className="mt-6 rounded-3xl border border-[#e2eae4] bg-white p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#eaf5ee] text-[#247253]">
                  <MapPin size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#17352b]">
                    Localização do animal
                  </h2>

                  <p className="text-xs text-[#9aaa9f]">
                    Local informado no momento do registro
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl bg-[#f2f6f2] p-6">
                <div className="flex flex-col items-center text-center">
                  <MapPin size={32} className="text-[#247253]" />

                  <p className="mt-3 text-sm font-medium text-[#17352b]">
                    Coordenadas da ocorrência
                  </p>

                  <p className="mt-2 text-xs text-[#718078]">
                    Latitude: {ocorrencia.latitude}
                    <br />
                    Longitude: {ocorrencia.longitude}
                  </p>

                  <a
                    href={urlMapa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#247253] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1d6045]"
                  >
                    <MapPin size={17} />
                    Abrir no Google Maps
                    <ExternalLink size={15} />
                  </a>
                </div>
              </div>
            </section>
          </>
        )}

        <footer className="mt-10 pb-5 text-center">
          <p className="text-xs text-[#9aaa9f]">
            ODS 15 — Vida Terrestre
          </p>
        </footer>
      </div>

      <Navbar />
    </main>
  );
}