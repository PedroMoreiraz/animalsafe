
"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import {
  Plus,
  PawPrint,
  Search,
  MapPin,
  CalendarDays,
  ClipboardList,
  RefreshCw,
  AlertCircle,
  ImageOff,
  ArrowRight,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Ocorrencia = {
  id: number;
  usuarioId: number;
  tipo_animal: string;
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

function formatarData(data: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(data));
}

export default function OcorrenciasPage() {
  const router = useRouter();

  const [busca, setBusca] = useState("");
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregarOcorrencias = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch("/api/ocorrencias", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const resultado = await resposta.json().catch(() => null);

      if (resposta.status === 401) {
        router.push("/login");
        return;
      }

      if (!resposta.ok) {
        throw new Error(
          resultado?.message ?? "Não foi possível carregar as ocorrências.",
        );
      }

      setOcorrencias(resultado?.ocorrencias ?? []);
    } catch (error) {
      console.error(error);

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar as ocorrências.",
      );
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    carregarOcorrencias();
  }, [carregarOcorrencias]);

  const ocorrenciasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return ocorrencias;

    return ocorrencias.filter((ocorrencia) => {
      return (
        ocorrencia.tipo_animal.toLowerCase().includes(termo) ||
        ocorrencia.situacao.toLowerCase().includes(termo) ||
        ocorrencia.descricao.toLowerCase().includes(termo) ||
        ocorrencia.usuario.primeiroNome.toLowerCase().includes(termo) ||
        ocorrencia.usuario.sobrenome.toLowerCase().includes(termo)
      );
    });
  }, [ocorrencias, busca]);

  return (
    <main className="min-h-screen bg-[#f8faf8] pb-28">
      <header className="border-b border-[#e6ece7] bg-white">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <p className="text-sm font-medium text-[#247253]">
            ANIMAL SAFETY
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#17352b]">
            Ocorrências
          </h1>

          <p className="mt-1 text-sm text-[#718078]">
            Registre e consulte animais em situação de risco.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6">
        <section className="flex flex-col justify-between gap-5 py-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-[#17352b]">
              Registros de ocorrências
            </h2>

            <p className="mt-2 text-sm text-[#718078]">
              Consulte os registros e ajude a proteger a vida animal.
            </p>
          </div>

          <Link
            href="/ocorrencias/nova"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#247253] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1d6045]"
          >
            <Plus size={18} />
            Nova ocorrência
          </Link>
        </section>

        <section className="rounded-2xl border border-[#e2eae4] bg-white p-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aaa9f]"
            />

            <input
              type="text"
              placeholder="Buscar por animal ou situação..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              className="w-full rounded-full border border-[#e2eae4] bg-[#fafcfa] py-3 pl-11 pr-5 text-sm text-[#17352b] outline-none transition placeholder:text-[#9aaa9f] focus:border-[#247253]"
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#17352b]">
                Todas as ocorrências
              </h2>

              {!carregando && !erro && (
                <p className="mt-1 text-xs text-[#9aaa9f]">
                  {ocorrenciasFiltradas.length} registros encontrados
                </p>
              )}
            </div>

            <button
              onClick={carregarOcorrencias}
              disabled={carregando}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-[#247253] transition hover:bg-[#eaf5ee] disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={carregando ? "animate-spin" : ""}
              />
              Atualizar
            </button>
          </div>

          {carregando && (
            <div className="flex flex-col items-center rounded-3xl border border-[#e2eae4] bg-white px-6 py-16 text-center">
              <RefreshCw
                size={30}
                className="animate-spin text-[#247253]"
              />

              <p className="mt-5 text-sm font-medium text-[#17352b]">
                Carregando ocorrências...
              </p>
            </div>
          )}

          {!carregando && erro && (
            <div className="flex flex-col items-center rounded-3xl border border-red-100 bg-white px-6 py-14 text-center">
              <AlertCircle size={30} className="text-red-500" />

              <h3 className="mt-5 text-lg font-semibold text-[#17352b]">
                Não foi possível carregar
              </h3>

              <p className="mt-2 text-sm text-[#718078]">{erro}</p>

              <button
                onClick={carregarOcorrencias}
                className="mt-6 rounded-full bg-[#247253] px-6 py-3 text-sm font-semibold text-white"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!carregando && !erro && ocorrencias.length === 0 && (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-[#d6e2d9] bg-white px-6 py-16 text-center">
              <ClipboardList size={32} className="text-[#247253]" />

              <h3 className="mt-6 text-lg font-semibold text-[#17352b]">
                Nenhuma ocorrência registrada
              </h3>

              <p className="mt-2 max-w-sm text-sm text-[#718078]">
                Ainda não existem ocorrências cadastradas.
              </p>

              <Link
                href="/ocorrencias/nova"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#247253] px-6 py-3 text-sm font-semibold text-white"
              >
                <Plus size={17} />
                Registrar primeira ocorrência
              </Link>
            </div>
          )}

          {!carregando &&
            !erro &&
            ocorrencias.length > 0 &&
            ocorrenciasFiltradas.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[#d6e2d9] bg-white px-6 py-14 text-center">
                <Search
                  size={30}
                  className="mx-auto text-[#9aaa9f]"
                />

                <h3 className="mt-5 font-semibold text-[#17352b]">
                  Nenhum resultado encontrado
                </h3>

                <button
                  onClick={() => setBusca("")}
                  className="mt-5 text-sm font-semibold text-[#247253]"
                >
                  Limpar pesquisa
                </button>
              </div>
            )}

          {!carregando &&
            !erro &&
            ocorrenciasFiltradas.length > 0 && (
              <div className="space-y-4">
                {ocorrenciasFiltradas.map((ocorrencia) => {
                  const foto = ocorrencia.foto_url
                    ? ocorrencia.foto_url.startsWith("http")
                      ? ocorrencia.foto_url
                      : `${API_URL}${ocorrencia.foto_url}`
                    : null;

                  return (
                    <Link
                      key={ocorrencia.id}
                      href={`/ocorrencias/${ocorrencia.id}`}
                      className="group block overflow-hidden rounded-2xl border border-[#e2eae4] bg-white transition hover:border-[#b8d2c0] hover:bg-[#fdfffd]"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex h-52 shrink-0 items-center justify-center overflow-hidden bg-[#f2f6f2] sm:h-auto sm:min-h-52 sm:w-52">
                          {foto ? (
                            <img
                              src={foto}
                              alt={`Foto de ${ocorrencia.tipo_animal}`}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-[#9aaa9f]">
                              <ImageOff size={30} />
                              <span className="text-xs">
                                Sem fotografia
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
                          <div>
                            <div className="flex items-center justify-end">
                              <span className="text-xs text-[#9aaa9f]">
                                #{ocorrencia.id}
                              </span>
                            </div>

                            <h3 className="mt-4 text-lg font-semibold text-[#17352b]">
                              {ocorrencia.tipo_animal}
                            </h3>

                            <p className="mt-1 text-sm font-medium text-[#247253]">
                              {ocorrencia.situacao}
                            </p>

                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#718078]">
                              {ocorrencia.descricao}
                            </p>
                          </div>

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ed] pt-4">
                            <div className="flex flex-wrap gap-4 text-xs text-[#87968d]">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={14} />
                                {formatarData(ocorrencia.data_registro)}
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <MapPin size={14} />
                                Localização registrada
                              </span>
                            </div>

                            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#247253]">
                              Ver detalhes

                              <ArrowRight
                                size={15}
                                className="transition group-hover:translate-x-1"
                              />
                            </span>
                          </div>

                          <p className="mt-3 text-xs text-[#87968d]">
                            Registrado por{" "}
                            <span className="font-medium text-[#52675c]">
                              {ocorrencia.usuario.primeiroNome}{" "}
                              {ocorrencia.usuario.sobrenome}
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
        </section>

        <section className="mt-8 flex gap-4 rounded-2xl bg-[#eaf5ee] p-5">
          <PawPrint
            size={23}
            className="mt-0.5 shrink-0 text-[#247253]"
          />

          <div>
            <h3 className="text-sm font-semibold text-[#17352b]">
              Sua participação faz a diferença
            </h3>

            <p className="mt-1 text-sm leading-6 text-[#52675c]">
              Ao registrar uma ocorrência, você ajuda a identificar
              situações de risco e facilita o encaminhamento para
              instituições responsáveis.
            </p>
          </div>
        </section>

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