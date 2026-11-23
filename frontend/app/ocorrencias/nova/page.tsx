
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";

import {
  ArrowLeft,
  MapPin,
  PawPrint,
  Camera,
  X,
  Navigation,
  ImagePlus,
  ScanSearch,
  LoaderCircle,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";

type Deteccao = {
  detectado: boolean;
  identificado: boolean;
  nome_comum: string | null;
  nome_cientifico: string | null;
  confianca: number | null;
  nivel_confianca: string | null;
  origem: string | null;
  confianca_deteccao: number | null;
  candidatos?: {
    nome_comum: string;
    nome_cientifico: string;
    pontuacao: number;
  }[];
};

type ResultadoReconhecimento = {
  detectado: boolean;
  modelo: string;
  deteccoes: Deteccao[];
  message?: string;
};

export default function NovaOcorrenciaPage() {
  const router = useRouter();

  const [tipoAnimal, setTipoAnimal] = useState("");
  const [origemAnimal, setOrigemAnimal] = useState("");
  const [situacao, setSituacao] = useState("");
  const [descricao, setDescricao] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [precisao, setPrecisao] = useState<number | null>(null);
  const [altitude, setAltitude] = useState<number | null>(null);

  const [localizacaoCarregada, setLocalizacaoCarregada] = useState(false);
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);
  const [erroLocalizacao, setErroLocalizacao] = useState("");

  const watchIdRef = useRef<number | null>(null);
  const timeoutLocalizacaoRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const melhorPosicaoRef = useRef<GeolocationPosition | null>(null);

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState("");

  const [reconhecendo, setReconhecendo] = useState(false);
  const [resultadoReconhecimento, setResultadoReconhecimento] =
    useState<ResultadoReconhecimento | null>(null);
  const [erroReconhecimento, setErroReconhecimento] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<"erro" | "sucesso" | "">("");
  const [enviando, setEnviando] = useState(false);

  // ==========================================
  // PRÉ-VISUALIZAÇÃO DA FOTO
  // ==========================================

  useEffect(() => {
    if (!foto) {
      setFotoPreview("");
      return;
    }

    const url = URL.createObjectURL(foto);
    setFotoPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [foto]);

  // ==========================================
  // LIMPEZA DA CAPTURA DE LOCALIZAÇÃO
  // ==========================================

  function limparCapturaLocalizacao() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (timeoutLocalizacaoRef.current !== null) {
      clearTimeout(timeoutLocalizacaoRef.current);
      timeoutLocalizacaoRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      if (
        watchIdRef.current !== null &&
        typeof navigator !== "undefined" &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      if (timeoutLocalizacaoRef.current !== null) {
        clearTimeout(timeoutLocalizacaoRef.current);
      }
    };
  }, []);

  // ==========================================
  // LOCALIZAÇÃO
  // ==========================================

  function obterLocalizacao() {
    limparCapturaLocalizacao();

    setErroLocalizacao("");
    setLocalizacaoCarregada(false);
    setCarregandoLocalizacao(true);

    setLatitude(null);
    setLongitude(null);
    setPrecisao(null);
    setAltitude(null);

    melhorPosicaoRef.current = null;

    if (!navigator.geolocation) {
      setErroLocalizacao(
        "Seu navegador não oferece suporte à localização.",
      );
      setCarregandoLocalizacao(false);
      return;
    }

    function encerrarCaptura(posicao?: GeolocationPosition) {
      const melhorPosicao =
        posicao ?? melhorPosicaoRef.current;

      limparCapturaLocalizacao();
      setCarregandoLocalizacao(false);

      if (!melhorPosicao) {
        setErroLocalizacao(
          "Não foi possível obter sua localização. Verifique o GPS e tente novamente.",
        );
        return;
      }

      const coordenadas = melhorPosicao.coords;

      setLatitude(coordenadas.latitude);
      setLongitude(coordenadas.longitude);
      setPrecisao(coordenadas.accuracy);
      setAltitude(coordenadas.altitude);
      setLocalizacaoCarregada(true);

      if (coordenadas.accuracy > 50) {
        setErroLocalizacao(
          "A localização foi obtida, mas a precisão está limitada. Se possível, tente novamente em um local aberto.",
        );
      } else if (coordenadas.accuracy > 15) {
        setErroLocalizacao(
          "A localização foi obtida. A precisão pode melhorar se você tentar novamente em um local aberto.",
        );
      }
    }

    function receberPosicao(position: GeolocationPosition) {
      const atual = melhorPosicaoRef.current;

      if (!atual || position.coords.accuracy < atual.coords.accuracy) {
        melhorPosicaoRef.current = position;
        setPrecisao(position.coords.accuracy);
      }

      const melhorPrecisao =
        melhorPosicaoRef.current?.coords.accuracy;

      // Encerra antecipadamente quando a precisão estimada
      // chega a 8 metros ou menos.
      if (melhorPrecisao !== undefined && melhorPrecisao <= 8) {
        encerrarCaptura(melhorPosicaoRef.current ?? position);
      }
    }

    function erroGPS(error: GeolocationPositionError) {
      // O timeout individual do navegador não encerra a captura.
      // O temporizador próprio controla o limite total de 20 segundos.
      if (error.code === error.TIMEOUT) {
        return;
      }

      if (melhorPosicaoRef.current) {
        encerrarCaptura();
        return;
      }

      limparCapturaLocalizacao();
      setCarregandoLocalizacao(false);

      if (error.code === error.PERMISSION_DENIED) {
        setErroLocalizacao(
          "Permita o acesso à localização no navegador para continuar.",
        );
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        setErroLocalizacao(
          "Não foi possível identificar sua localização. Verifique se o GPS está ativado.",
        );
      } else {
        setErroLocalizacao(
          "Ocorreu um erro ao obter a localização. Tente novamente.",
        );
      }
    }

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        receberPosicao,
        erroGPS,
        {
          enableHighAccuracy: true,
          timeout: 25000,
          maximumAge: 0,
        },
      );

      // Limite total da tentativa: 20 segundos.
      timeoutLocalizacaoRef.current = setTimeout(() => {
        encerrarCaptura();
      }, 20000);
    } catch {
      limparCapturaLocalizacao();
      setCarregandoLocalizacao(false);
      setErroLocalizacao(
        "Não foi possível iniciar a captura da localização.",
      );
    }
  }

  // ==========================================
  // SELEÇÃO DE FOTO
  // ==========================================

  function selecionarFoto(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    const formatosPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!formatosPermitidos.includes(arquivo.type)) {
      setMensagem("Utilize uma imagem JPG, PNG ou WEBP.");
      setTipoMensagem("erro");
      event.target.value = "";
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      setMensagem("A imagem deve ter no máximo 5 MB.");
      setTipoMensagem("erro");
      event.target.value = "";
      return;
    }

    setMensagem("");
    setTipoMensagem("");
    setResultadoReconhecimento(null);
    setErroReconhecimento("");
    setFoto(arquivo);
  }

  function removerFoto() {
    setFoto(null);
    setResultadoReconhecimento(null);
    setErroReconhecimento("");
  }

  // ==========================================
  // RECONHECIMENTO DO ANIMAL - SPECIESNET
  // ==========================================

  async function reconhecerAnimal() {
    if (!foto || reconhecendo || enviando) return;

    setReconhecendo(true);
    setErroReconhecimento("");
    setResultadoReconhecimento(null);

    try {
      const formData = new FormData();
      formData.append("foto", foto);

      const response = await fetch("/api/reconhecimento", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const resultado = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        throw new Error(
          resultado?.message ||
            "Não foi possível realizar o reconhecimento do animal.",
        );
      }

      if (!resultado || !Array.isArray(resultado.deteccoes)) {
        throw new Error(
          "O serviço retornou uma resposta inválida.",
        );
      }

      setResultadoReconhecimento(resultado);
    } catch (error) {
      setErroReconhecimento(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao reconhecer o animal.",
      );
    } finally {
      setReconhecendo(false);
    }
  }

  // ==========================================
  // CADASTRO DA OCORRÊNCIA
  // ==========================================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (enviando) return;

    setMensagem("");
    setTipoMensagem("");

    if (
      !localizacaoCarregada ||
      latitude === null ||
      longitude === null
    ) {
      setMensagem("Obtenha sua localização antes de continuar.");
      setTipoMensagem("erro");
      return;
    }

    if (
      !tipoAnimal ||
      !origemAnimal ||
      !situacao ||
      !descricao.trim()
    ) {
      setMensagem("Preencha todos os campos obrigatórios.");
      setTipoMensagem("erro");
      return;
    }

    if (descricao.trim().length > 1000) {
      setMensagem("A descrição deve ter no máximo 1000 caracteres.");
      setTipoMensagem("erro");
      return;
    }

    try {
      setEnviando(true);

      const formData = new FormData();

      formData.append("tipo_animal", tipoAnimal);
      formData.append("origem_animal", origemAnimal);
      formData.append("situacao", situacao);
      formData.append("descricao", descricao.trim());
      formData.append("latitude", String(latitude));
      formData.append("longitude", String(longitude));

      if (foto) {
        formData.append("foto", foto);
      }

      const response = await fetch("/api/ocorrencias", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const resultado = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        throw new Error(
          resultado?.message || "Não foi possível registrar a ocorrência.",
        );
      }

      setMensagem(
        resultado?.message || "Ocorrência registrada com sucesso!",
      );
      setTipoMensagem("sucesso");

      router.push("/ocorrencias");
      router.refresh();
    } catch (error) {
      setMensagem(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao registrar a ocorrência.",
      );
      setTipoMensagem("erro");
    } finally {
      setEnviando(false);
    }
  }

  // ==========================================
  // RESULTADOS DO RECONHECIMENTO
  // ==========================================

  const deteccoesValidas =
    resultadoReconhecimento?.deteccoes.filter(
      (deteccao) =>
        deteccao.detectado &&
        (deteccao.confianca_deteccao === null ||
          deteccao.confianca_deteccao === undefined ||
          deteccao.confianca_deteccao >= 0.1),
    ) ?? [];

  function formatarConfianca(valor: number | null) {
    if (valor === null || valor === undefined) return null;
    return `${(valor * 100).toFixed(2).replace(".", ",")}%`;
  }

  function obterNivelConfianca(valor: number | null) {
    if (valor === null || valor === undefined) {
      return "Não disponível";
    }

    if (valor >= 0.9) return "Alta";
    if (valor >= 0.7) return "Moderada";
    return "Baixa";
  }

  function obterDescricaoPrecisao(valor: number) {
    if (valor <= 8) return "Muito boa";
    if (valor <= 15) return "Boa";
    if (valor <= 50) return "Moderada";
    return "Limitada";
  }

  return (
    <main className="min-h-screen bg-[#f8faf8] pb-28">
      {/* CABEÇALHO */}
      <header className="border-b border-[#e6ece7] bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-5">
          <Link
            href="/ocorrencias"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-[#718078] transition hover:bg-[#f2f6f2]"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <p className="text-sm font-medium text-[#247253]">
              ANIMAL SAFETY
            </p>

            <h1 className="mt-1 text-xl font-semibold text-[#17352b]">
              Nova ocorrência
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6">
        {/* INTRODUÇÃO */}
        <section className="pb-7 pt-9">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eaf5ee] text-[#247253]">
            <PawPrint size={25} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[#17352b]">
            Conte o que aconteceu
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#718078]">
            Informe os detalhes do animal e sua situação para ajudar
            no encaminhamento da ocorrência.
          </p>
        </section>

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* INFORMAÇÕES DO ANIMAL */}
          <section className="rounded-3xl border border-[#e2eae4] bg-white p-6 sm:p-8">
            <h3 className="text-base font-semibold text-[#17352b]">
              Informações do animal
            </h3>

            <p className="mt-1 text-sm text-[#718078]">
              Identifique o animal e a situação encontrada.
            </p>

            {/* TIPO */}
            <div className="mt-7">
              <label
                htmlFor="tipoAnimal"
                className="mb-2 block text-sm font-medium text-[#17352b]"
              >
                Tipo de animal <span className="text-red-500">*</span>
              </label>

              <select
                id="tipoAnimal"
                required
                value={tipoAnimal}
                onChange={(event) => setTipoAnimal(event.target.value)}
                className="w-full rounded-full border border-[#d6ded8] bg-white px-5 py-3.5 text-sm text-[#17352b] outline-none transition focus:border-[#247253]"
              >
                <option value="">Selecione o tipo de animal</option>
                <option value="Mamífero">Mamífero</option>
                <option value="Ave">Ave</option>
                <option value="Réptil">Réptil</option>
                <option value="Anfíbio">Anfíbio</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            {/* ORIGEM DO ANIMAL */}
            <div className="mt-5">
              <label
                htmlFor="origemAnimal"
                className="mb-2 block text-sm font-medium text-[#17352b]"
              >
                Origem do animal <span className="text-red-500">*</span>
              </label>

              <select
                id="origemAnimal"
                required
                value={origemAnimal}
                onChange={(event) => setOrigemAnimal(event.target.value)}
                className="w-full rounded-full border border-[#d6ded8] bg-white px-5 py-3.5 text-sm text-[#17352b] outline-none transition focus:border-[#247253]"
              >
                <option value="">Selecione a origem do animal</option>
                <option value="Silvestre">Animal silvestre</option>
                <option value="Doméstico">Animal doméstico</option>
                <option value="Não sei identificar">Não sei identificar</option>
              </select>

              <p className="mt-2 text-xs leading-5 text-[#718078]">
                Essa informação ajuda o sistema a selecionar orientações
                adequadas para o animal encontrado.
              </p>
            </div>

            {/* SITUAÇÃO */}
            <div className="mt-5">
              <label
                htmlFor="situacao"
                className="mb-2 block text-sm font-medium text-[#17352b]"
              >
                Situação encontrada <span className="text-red-500">*</span>
              </label>

              <select
                id="situacao"
                required
                value={situacao}
                onChange={(event) => setSituacao(event.target.value)}
                className="w-full rounded-full border border-[#d6ded8] bg-white px-5 py-3.5 text-sm text-[#17352b] outline-none transition focus:border-[#247253]"
              >
                <option value="">Selecione a situação</option>
                <option value="Animal perdido">Animal perdido</option>
                <option value="Animal ferido">Animal ferido</option>
                <option value="Animal abandonado">Animal abandonado</option>
                <option value="Animal em situação de risco">
                  Animal em situação de risco
                </option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            {/* DESCRIÇÃO */}
            <div className="mt-5">
              <label
                htmlFor="descricao"
                className="mb-2 block text-sm font-medium text-[#17352b]"
              >
                Descrição <span className="text-red-500">*</span>
              </label>

              <textarea
                id="descricao"
                required
                rows={5}
                maxLength={1000}
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Descreva o que aconteceu, as condições do animal e outras informações importantes..."
                className="w-full resize-none rounded-2xl border border-[#d6ded8] bg-white px-5 py-4 text-sm leading-6 text-[#17352b] outline-none transition placeholder:text-[#9aaa9f] focus:border-[#247253]"
              />

              <p className="mt-2 text-right text-xs text-[#9aaa9f]">
                {descricao.length}/1000 caracteres
              </p>
            </div>
          </section>

          {/* LOCALIZAÇÃO */}
          <section className="rounded-3xl border border-[#e2eae4] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#247253]">
                <MapPin size={21} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#17352b]">
                  Localização
                </h3>

                <p className="text-sm text-[#718078]">
                  Informe onde o animal foi encontrado.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#f8faf8] p-5">
              {carregandoLocalizacao ? (
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-[#247253]">
                    <LoaderCircle size={18} className="animate-spin" />
                    Buscando a melhor localização...
                  </p>

                  <p className="mt-3 text-sm leading-6 text-[#718078]">
                    Aguarde enquanto o dispositivo coleta diferentes
                    leituras do GPS. Isso pode levar alguns segundos.
                  </p>

                  {precisao !== null && (
                    <p className="mt-3 text-xs font-medium text-[#247253]">
                      Precisão estimada atual: ±{precisao.toFixed(1)} metros
                    </p>
                  )}

                  <p className="mt-2 text-xs text-[#9aaa9f]">
                    A captura será encerrada automaticamente em até 20 segundos.
                  </p>
                </div>
              ) : localizacaoCarregada ? (
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-[#247253]">
                    <CheckCircle2 size={18} />
                    Localização obtida com sucesso
                  </p>

                  <div className="mt-4 space-y-2 text-xs leading-6 text-[#718078]">
                    <p>
                      Latitude: {latitude?.toFixed(7)}
                    </p>

                    <p>
                      Longitude: {longitude?.toFixed(7)}
                    </p>

                    {altitude !== null && (
                      <p>
                        Altitude: {altitude.toFixed(1)} metros
                      </p>
                    )}

                    {precisao !== null && (
                      <>
                        <p>
                          Precisão estimada: ±{precisao.toFixed(1)} metros
                        </p>

                        <p>
                          Qualidade da localização:{" "}
                          <span className="font-semibold text-[#247253]">
                            {obterDescricaoPrecisao(precisao)}
                          </span>
                        </p>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={obterLocalizacao}
                    disabled={carregandoLocalizacao || enviando}
                    className="mt-5 text-sm font-semibold text-[#247253] hover:underline disabled:opacity-50"
                  >
                    Capturar novamente
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-[#17352b]">
                    Obtenha sua localização atual
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#718078]">
                    O aplicativo coletará várias leituras do GPS e
                    selecionará automaticamente a mais precisa.
                  </p>

                  <button
                    type="button"
                    onClick={obterLocalizacao}
                    disabled={carregandoLocalizacao || enviando}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#247253] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d6045] disabled:opacity-50"
                  >
                    <Navigation size={17} />
                    Obter minha localização
                  </button>
                </div>
              )}

              {erroLocalizacao && (
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-800">
                  {erroLocalizacao}
                </p>
              )}
            </div>

            <p className="mt-3 text-xs leading-5 text-[#9aaa9f]">
              A precisão apresentada é uma estimativa informada pelo
              dispositivo e pode variar conforme o sinal do GPS e o ambiente.
            </p>
          </section>

          {/* FOTO E RECONHECIMENTO */}
          <section className="rounded-3xl border border-[#e2eae4] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#247253]">
                <Camera size={21} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#17352b]">
                  Foto do animal
                </h3>

                <p className="text-sm text-[#718078]">
                  A foto é opcional.
                </p>
              </div>
            </div>

            {fotoPreview ? (
              <div className="relative mt-6 overflow-hidden rounded-2xl border border-[#e2eae4]">
                <img
                  src={fotoPreview}
                  alt="Foto do animal"
                  className="max-h-72 w-full object-contain"
                />

                <button
                  type="button"
                  onClick={removerFoto}
                  disabled={enviando || reconhecendo}
                  aria-label="Remover foto"
                  className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white text-[#718078] shadow-sm hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <X size={18} />
                </button>

                <div className="bg-[#f8faf8] px-4 py-3">
                  <p className="truncate text-xs text-[#718078]">
                    {foto?.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {/* ABRIR CÂMERA */}
                <label className="flex cursor-pointer flex-col items-center rounded-2xl border border-[#d6ded8] bg-[#fafcfa] px-4 py-7 text-center transition hover:border-[#247253] hover:bg-[#f5faf6]">
                  <div className="flex size-12 items-center justify-center rounded-full bg-[#eaf5ee] text-[#247253]">
                    <Camera size={24} />
                  </div>

                  <span className="mt-3 text-sm font-semibold text-[#17352b]">
                    Tirar foto
                  </span>

                  <span className="mt-1 text-xs text-[#718078]">
                    Abrir câmera do dispositivo
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    onChange={selecionarFoto}
                    disabled={enviando || reconhecendo}
                    className="hidden"
                  />
                </label>

                {/* ESCOLHER DA GALERIA */}
                <label className="flex cursor-pointer flex-col items-center rounded-2xl border border-[#d6ded8] bg-[#fafcfa] px-4 py-7 text-center transition hover:border-[#247253] hover:bg-[#f5faf6]">
                  <div className="flex size-12 items-center justify-center rounded-full bg-[#eaf5ee] text-[#247253]">
                    <ImagePlus size={24} />
                  </div>

                  <span className="mt-3 text-sm font-semibold text-[#17352b]">
                    Escolher da galeria
                  </span>

                  <span className="mt-1 text-xs text-[#718078]">
                    Selecionar imagem existente
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={selecionarFoto}
                    disabled={enviando || reconhecendo}
                    className="hidden"
                  />
                </label>

                <p className="text-center text-xs text-[#9aaa9f] sm:col-span-2">
                  Imagens JPG, PNG ou WEBP de até 5 MB.
                </p>
              </div>
            )}

            {/* RECONHECIMENTO */}
            {foto && (
              <div className="mt-6 border-t border-[#e6ece7] pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#247253]">
                    <ScanSearch size={21} />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-[#17352b]">
                      Reconhecimento do animal
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-[#718078]">
                      Utilize inteligência artificial para analisar a foto
                      e obter uma possível identificação.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={reconhecerAnimal}
                  disabled={reconhecendo || enviando}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#247253] px-5 py-3.5 text-sm font-semibold text-[#247253] transition hover:bg-[#eaf5ee] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {reconhecendo ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Analisando imagem...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      {resultadoReconhecimento
                        ? "Analisar novamente"
                        : "Identificar animal"}
                    </>
                  )}
                </button>

                {reconhecendo && (
                  <p className="mt-3 text-center text-xs leading-5 text-[#718078]">
                    A análise pode levar alguns minutos. Aguarde enquanto
                    o modelo processa a imagem.
                  </p>
                )}

                {/* ERRO DO RECONHECIMENTO */}
                {erroReconhecimento && (
                  <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700">
                    {erroReconhecimento}
                  </div>
                )}

                {/* RESULTADO DO RECONHECIMENTO */}
                {resultadoReconhecimento && (
                  <div className="mt-5 rounded-2xl border border-[#d6e8da] bg-[#f8fcf8] p-5">
                    {deteccoesValidas.length > 0 ? (
                      <>
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#247253]">
                          <CheckCircle2 size={18} />
                          Análise concluída
                        </div>

                        <div className="mt-4 space-y-4">
                          {deteccoesValidas.map((deteccao, index) => {
                            const identificacaoValida =
                              deteccao.identificado === true &&
                              deteccao.origem === "classifier" &&
                              Boolean(deteccao.nome_comum);

                            return (
                              <div
                                key={`${deteccao.nome_cientifico ?? "animal"}-${index}`}
                                className="rounded-xl border border-[#e2eae4] bg-white p-4"
                              >
                                {identificacaoValida ? (
                                  <>
                                    <p className="text-xs font-medium uppercase tracking-wide text-[#718078]">
                                      Possível identificação
                                    </p>

                                    <p className="mt-2 text-lg font-semibold text-[#17352b]">
                                      {deteccao.nome_comum}
                                    </p>

                                    {deteccao.nome_cientifico && (
                                      <p className="mt-1 text-sm italic text-[#718078]">
                                        {deteccao.nome_cientifico}
                                      </p>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-2">
                                      {formatarConfianca(deteccao.confianca) && (
                                        <span className="rounded-full bg-[#eaf5ee] px-3 py-1.5 text-xs font-medium text-[#247253]">
                                          Confiança:{" "}
                                          {formatarConfianca(deteccao.confianca)}
                                        </span>
                                      )}

                                      <span className="rounded-full bg-[#f2f5f2] px-3 py-1.5 text-xs font-medium text-[#718078]">
                                        Nível:{" "}
                                        {obterNivelConfianca(deteccao.confianca)}
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm font-semibold text-[#17352b]">
                                      Animal detectado
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-[#718078]">
                                      O modelo identificou a presença de um
                                      animal, mas não conseguiu determinar
                                      sua espécie com segurança.
                                    </p>

                                    {formatarConfianca(deteccao.confianca_deteccao) && (
                                      <p className="mt-3 text-xs text-[#718078]">
                                        Confiança da detecção:{" "}
                                        {formatarConfianca(deteccao.confianca_deteccao)}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {resultadoReconhecimento.deteccoes.some(
                          (deteccao) =>
                            deteccao.identificado === true &&
                            deteccao.origem === "classifier",
                        ) && (
                          <p className="mt-4 text-xs leading-5 text-[#718078]">
                            A identificação é uma sugestão gerada por
                            inteligência artificial e pode estar incorreta.
                            Confira a imagem e selecione manualmente o tipo
                            de animal no formulário.
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#718078]">
                          <Info size={18} />
                          Nenhum animal identificado
                        </div>

                        <p className="mt-3 text-sm leading-6 text-[#718078]">
                          Não foi possível identificar um animal nessa
                          imagem. Você ainda pode preencher o formulário
                          manualmente e registrar a ocorrência.
                        </p>
                      </>
                    )}

                    <p className="mt-4 text-xs text-[#9aaa9f]">
                      Modelo utilizado: SpeciesNet {resultadoReconhecimento.modelo}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* MENSAGEM */}
          {mensagem && (
            <div
              className={`rounded-2xl px-5 py-4 text-sm leading-6 ${
                tipoMensagem === "erro"
                  ? "bg-red-50 text-red-700"
                  : "bg-[#eaf5ee] text-[#247253]"
              }`}
              role="status"
              aria-live="polite"
            >
              {mensagem}
            </div>
          )}

          {/* AÇÕES */}
          <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">
            <Link
              href="/ocorrencias"
              className={`inline-flex items-center justify-center rounded-full border border-[#d6ded8] px-7 py-3.5 text-sm font-semibold text-[#718078] transition hover:bg-white ${
                enviando || reconhecendo ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={enviando || reconhecendo || carregandoLocalizacao}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#247253] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1d6045] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? "Registrando ocorrência..." : "Registrar ocorrência"}
            </button>
          </div>
        </form>

        <footer className="pb-5 text-center">
          <p className="text-xs text-[#9aaa9f]">
            ODS 15 — Vida Terrestre
          </p>
        </footer>
      </div>

      <Navbar />
    </main>
  );
}