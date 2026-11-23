
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "@/components/navbar";

import {
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Filter,
} from "lucide-react";

type Instituicao = {
  id: number;
  nome: string;
  categoria: string;
  descricao: string;
  abrangencia: string;
  uf: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  site: string | null;
  cnpj: string | null;
};

const estados = [
  { uf: "AC", nome: "Acre" },
  { uf: "AL", nome: "Alagoas" },
  { uf: "AP", nome: "Amapá" },
  { uf: "AM", nome: "Amazonas" },
  { uf: "BA", nome: "Bahia" },
  { uf: "CE", nome: "Ceará" },
  { uf: "DF", nome: "Distrito Federal" },
  { uf: "ES", nome: "Espírito Santo" },
  { uf: "GO", nome: "Goiás" },
  { uf: "MA", nome: "Maranhão" },
  { uf: "MT", nome: "Mato Grosso" },
  { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" },
  { uf: "PA", nome: "Pará" },
  { uf: "PB", nome: "Paraíba" },
  { uf: "PR", nome: "Paraná" },
  { uf: "PE", nome: "Pernambuco" },
  { uf: "PI", nome: "Piauí" },
  { uf: "RJ", nome: "Rio de Janeiro" },
  { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RS", nome: "Rio Grande do Sul" },
  { uf: "RO", nome: "Rondônia" },
  { uf: "RR", nome: "Roraima" },
  { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "São Paulo" },
  { uf: "SE", nome: "Sergipe" },
  { uf: "TO", nome: "Tocantins" },
];

export default function InstituicoesPage() {
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  const [ufSelecionada, setUfSelecionada] = useState("Todas");
  const [abrangenciaSelecionada, setAbrangenciaSelecionada] =
    useState("Todas");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregarInstituicoes = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch("/api/instituicoes", {
        method: "GET",
        cache: "no-store",
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar as instituições.");
      }

      const resultado = await resposta.json();

      setInstituicoes(resultado.instituicoes ?? []);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao carregar as instituições."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarInstituicoes();
  }, [carregarInstituicoes]);

  const categorias = useMemo(() => {
    return [
      "Todas",
      ...Array.from(
        new Set(instituicoes.map((item) => item.categoria))
      ).sort(),
    ];
  }, [instituicoes]);

  const instituicoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return instituicoes.filter((instituicao) => {
      const correspondeBusca =
        !termo ||
        instituicao.nome.toLowerCase().includes(termo) ||
        instituicao.categoria.toLowerCase().includes(termo) ||
        instituicao.descricao.toLowerCase().includes(termo);

      const correspondeCategoria =
        categoriaSelecionada === "Todas" ||
        instituicao.categoria === categoriaSelecionada;

      const correspondeUF =
        ufSelecionada === "Todas" ||
        instituicao.uf === ufSelecionada;

      const correspondeAbrangencia =
        abrangenciaSelecionada === "Todas" ||
        instituicao.abrangencia === abrangenciaSelecionada;

      return (
        correspondeBusca &&
        correspondeCategoria &&
        correspondeUF &&
        correspondeAbrangencia
      );
    });
  }, [
    instituicoes,
    busca,
    categoriaSelecionada,
    ufSelecionada,
    abrangenciaSelecionada,
  ]);

  function nomeEstado(uf: string | null) {
    if (!uf) return "Brasil";
    return estados.find((estado) => estado.uf === uf)?.nome ?? uf;
  }

  return (
    <main className="min-h-screen bg-white pb-28 text-[#17352b]">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">

        {/* Cabeçalho */}
        <div className="mb-10">
          <Link
            href="/home"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[#718078] transition hover:text-[#247253]"
          >
            <span aria-hidden="true">←</span>
            Voltar ao início
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf5ee] text-[#247253]">
              <Building2 size={24} />
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-[#247253]">
                Diretório de atendimento
              </p>

              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Instituições
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718078] md:text-base">
                Encontre órgãos e instituições responsáveis pela proteção
                ambiental e pelo atendimento de situações envolvendo animais
                em todo o Brasil.
              </p>
            </div>
          </div>
        </div>

        {/* Pesquisa */}
        <section className="mb-8">
          <label
            htmlFor="busca-instituicao"
            className="mb-2 block text-sm font-medium"
          >
            Buscar instituição
          </label>

          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#718078]"
            />

            <input
              id="busca-instituicao"
              type="text"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Pesquise pelo nome ou tipo de atendimento..."
              className="h-12 w-full rounded-xl border border-[#d6ded8] bg-white pl-12 pr-4 text-sm outline-none transition placeholder:text-[#9aa69e] focus:border-[#247253] focus:ring-2 focus:ring-[#247253]/10"
            />
          </div>
        </section>

        {/* Filtros */}
        <section className="mb-8 rounded-2xl border border-[#e6ece7] bg-[#fbfcfb] p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Filter size={17} className="text-[#247253]" />
            Filtrar instituições
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-[#718078]">
                Abrangência
              </label>

              <select
                value={abrangenciaSelecionada}
                onChange={(event) =>
                  setAbrangenciaSelecionada(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-[#d6ded8] bg-white px-3 text-sm outline-none focus:border-[#247253]"
              >
                <option value="Todas">Todas as abrangências</option>
                <option value="Nacional">Nacional</option>
                <option value="Estadual">Estadual</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-[#718078]">
                Estado
              </label>

              <select
                value={ufSelecionada}
                onChange={(event) => setUfSelecionada(event.target.value)}
                className="h-11 w-full rounded-xl border border-[#d6ded8] bg-white px-3 text-sm outline-none focus:border-[#247253]"
              >
                <option value="Todas">Todos os estados</option>

                {estados.map((estado) => (
                  <option key={estado.uf} value={estado.uf}>
                    {estado.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-[#718078]">
                Categoria
              </label>

              <select
                value={categoriaSelecionada}
                onChange={(event) =>
                  setCategoriaSelecionada(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-[#d6ded8] bg-white px-3 text-sm outline-none focus:border-[#247253]"
              >
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Resultado */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              Instituições disponíveis
            </h2>

            <p className="mt-1 text-sm text-[#718078]">
              {instituicoesFiltradas.length} resultado(s) encontrado(s)
            </p>
          </div>

          <button
            type="button"
            onClick={carregarInstituicoes}
            disabled={carregando}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#247253] transition hover:bg-[#eaf5ee] disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={carregando ? "animate-spin" : ""}
            />
            Atualizar
          </button>
        </div>

        {/* Carregamento */}
        {carregando && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e6ece7] py-16 text-center">
            <RefreshCw size={25} className="animate-spin text-[#247253]" />
            <p className="mt-4 text-sm text-[#718078]">
              Carregando instituições...
            </p>
          </div>
        )}

        {/* Erro */}
        {!carregando && erro && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle size={19} />
              <p className="text-sm font-medium">{erro}</p>
            </div>

            <button
              type="button"
              onClick={carregarInstituicoes}
              className="mt-4 rounded-lg bg-[#247253] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#17352b]"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Lista */}
        {!carregando && !erro && instituicoesFiltradas.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {instituicoesFiltradas.map((instituicao) => (
              <article
                key={instituicao.id}
                className="rounded-2xl border border-[#e6ece7] bg-white p-5 transition hover:border-[#b8d2c0] md:p-6"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#247253]">
                    <Building2 size={21} />
                  </div>

                  <span className="rounded-full bg-[#eaf5ee] px-3 py-1 text-xs font-medium text-[#247253]">
                    {instituicao.abrangencia === "Nacional"
                      ? "Nacional"
                      : instituicao.uf}
                  </span>
                </div>

                <h3 className="text-lg font-semibold leading-snug">
                  {instituicao.nome}
                </h3>

                <p className="mt-1 text-xs font-medium text-[#247253]">
                  {instituicao.categoria}
                </p>

                <p className="mt-3 text-sm leading-6 text-[#718078]">
                  {instituicao.descricao}
                </p>

                <div className="mt-5 space-y-3 border-t border-[#e6ece7] pt-4">
                  <div className="flex items-start gap-2 text-sm text-[#718078]">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-[#247253]"
                    />
                    <span>
                      {instituicao.endereco ||
                        `Abrangência: ${nomeEstado(instituicao.uf)}`}
                    </span>
                  </div>

                  {instituicao.telefone && (
                    <a
                      href={`tel:${instituicao.telefone.replace(/[^\d+]/g, "")}`}
                      className="flex items-center gap-2 text-sm text-[#718078] transition hover:text-[#247253]"
                    >
                      <Phone size={16} className="text-[#247253]" />
                      {instituicao.telefone}
                    </a>
                  )}

                  {instituicao.email && (
                    <a
                      href={`mailto:${instituicao.email}`}
                      className="flex items-center gap-2 break-all text-sm text-[#718078] transition hover:text-[#247253]"
                    >
                      <Mail size={16} className="shrink-0 text-[#247253]" />
                      {instituicao.email}
                    </a>
                  )}

                  {instituicao.site && (
                    <a
                      href={instituicao.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#247253] transition hover:text-[#17352b]"
                    >
                      <Globe size={16} />
                      Acessar site oficial
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Nenhum resultado */}
        {!carregando && !erro && instituicoesFiltradas.length === 0 && (
          <div className="rounded-2xl border border-[#e6ece7] px-5 py-16 text-center">
            <Building2
              size={32}
              className="mx-auto text-[#9aa69e]"
            />

            <h3 className="mt-4 font-semibold">
              Nenhuma instituição encontrada
            </h3>

            <p className="mt-2 text-sm text-[#718078]">
              Tente alterar a pesquisa ou os filtros selecionados.
            </p>

            <button
              type="button"
              onClick={() => {
                setBusca("");
                setCategoriaSelecionada("Todas");
                setUfSelecionada("Todas");
                setAbrangenciaSelecionada("Todas");
              }}
              className="mt-5 text-sm font-medium text-[#247253] hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}

        <div className="mt-12 border-t border-[#e6ece7] pt-6 text-center">
          <p className="text-xs leading-5 text-[#718078]">
            As instituições listadas são referências de atendimento e
            fiscalização. A disponibilidade de serviços e o atendimento de
            cada órgão devem ser confirmados diretamente nos canais oficiais.
          </p>

          <p className="mt-3 text-xs text-[#9aa69e]">
            Animal Safety · ODS 15 — Vida Terrestre
          </p>
        </div>
      </div>

      <Navbar />
    </main>
  );
}