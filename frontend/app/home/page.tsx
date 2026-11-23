
"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, MapPin, PawPrint, Building2, ArrowRight } from "lucide-react";

type SessionUser = {
  id: number;
  username: string;
  primeiroNome: string;
  sobrenome: string;
};

export default function HomePage() {
  const router = useRouter();

  const [user, setUser] = useState<SessionUser | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          setError("Não foi possível carregar sua conta.");
          return;
        }

        const result = await response.json();

        if (isActive) setUser(result.user);
      } catch {
        if (isActive) {
          setError("Não foi possível conectar ao servidor.");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadSession();

    return () => {
      isActive = false;
    };
  }, [router]);

  async function handleLogout() {
    setError("");
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        setError("Não foi possível encerrar sua sessão.");
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-[#718078]">
          Carregando sua conta...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="text-sm text-red-700">
            {error || "Não foi possível carregar sua conta."}
          </p>
          <button
            onClick={() => router.replace("/login")}
            className="mt-5 rounded-full bg-[#247253] px-6 py-3 text-sm text-white"
          >
            Voltar para o login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faf8] pb-28">

      {/* CABEÇALHO */}
      <header className="border-b border-[#e6ece7] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

          <Image
            src="/logo/logo.png"
            alt="Animal Safety"
            width={180}
            height={90}
            priority
            className="h-auto w-[135px] object-contain"
          />

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[#718078] transition hover:bg-[#f5f5f5] disabled:opacity-50"
          >
            <LogOut size={17} />
            {isLoggingOut ? "Saindo..." : "Sair"}
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6">

        {/* BOAS-VINDAS */}
        <section className="pb-8 pt-10">
          <p className="text-sm font-medium text-[#247253]">
            SUA REDE DE PROTEÇÃO ANIMAL
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#17352b] sm:text-4xl">
            Olá, {user.primeiroNome}!
          </h1>

          <p className="mt-3 max-w-lg text-[15px] leading-7 text-[#718078]">
            Cada atitude importa. Ajude a proteger os animais e contribua
            para preservar a vida terrestre.
          </p>
        </section>

        {/* REGISTRAR OCORRÊNCIA */}
        <section className="rounded-3xl bg-[#247253] p-7 text-white sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-sm font-medium text-white/75">
                PRECISA DE AJUDA?
              </span>

              <h2 className="mt-3 max-w-md text-2xl font-semibold leading-tight sm:text-3xl">
                Encontrou um animal em situação de risco?
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
                Registre uma ocorrência para facilitar o encaminhamento
                aos responsáveis pelo atendimento.
              </p>
            </div>

            <PawPrint
              size={36}
              className="shrink-0 text-white/70"
            />
          </div>

          <Link
            href="/ocorrencias"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#247253] transition hover:bg-[#edf5ef]"
          >
            Registrar ocorrência
            <ArrowRight size={17} />
          </Link>
        </section>

        {/* ACESSOS */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-[#17352b]">
            Explore o aplicativo
          </h2>

          <p className="mt-2 text-sm text-[#718078]">
            Acesse os recursos disponíveis.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <Link
              href="/ocorrencias"
              className="group rounded-2xl border border-[#e2eae4] bg-white p-6 transition hover:border-[#247253]/40"
            >
              <PawPrint size={25} className="text-[#247253]" />

              <h3 className="mt-5 font-semibold text-[#17352b]">
                Ocorrências
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#718078]">
                Registre animais encontrados e consulte as ocorrências.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#247253]">
                Acessar <ArrowRight size={16} />
              </div>
            </Link>

            <Link
              href="/instituicoes"
              className="group rounded-2xl border border-[#e2eae4] bg-white p-6 transition hover:border-[#247253]/40"
            >
              <Building2 size={25} className="text-[#247253]" />

              <h3 className="mt-5 font-semibold text-[#17352b]">
                Instituições
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#718078]">
                Encontre instituições responsáveis pela proteção animal.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#247253]">
                Acessar <ArrowRight size={16} />
              </div>
            </Link>

          </div>
        </section>

        {error && (
          <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* IDENTIFICAÇÃO */}
        <footer className="mt-12 pb-5 text-center">
          <p className="text-xs text-[#9aaa9f]">
            Contribuindo para o ODS 15 — Vida Terrestre
          </p>
        </footer>

      </div>

      <Navbar />
    </main>
  );
}