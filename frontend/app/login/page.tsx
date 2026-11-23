"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const fieldClassName =
  "mt-2 w-full rounded-full border border-[#d6ded8] bg-white px-5 py-3.5 text-sm text-[#17352b] outline-none transition placeholder:text-[#9aaa9f] focus:border-[#247253] focus:ring-2 focus:ring-[#247253]/10";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: formData.get("identifier"),
          senha: formData.get("senha"),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setError(result?.message ?? "Não foi possível entrar. Tente novamente.");
        return;
      }

      router.push("/home");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12">

      <section className="w-full max-w-[380px]">

        {/* TÍTULO */}
        <div className="mt-4">
          <p className="text-sm font-medium text-[#247253]">
            Bem-vindo de volta
          </p>

          <h1 className="mt-3 text-[34px] font-semibold tracking-tight text-[#17352b] leading-tight">
            Entre na sua conta.
          </h1>

          <p className="mt-3 text-[15px] leading-6 text-[#718078]">
            Acesse sua conta para acompanhar e registrar os cuidados com os animais.
          </p>
        </div>

        {/* FORMULÁRIO */}
        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>

          <label className="block text-sm font-medium text-[#29483b]">
            E-mail ou usuário

            <input
              className={fieldClassName}
              type="text"
              name="identifier"
              autoComplete="username"
              placeholder="Digite seu e-mail ou usuário"
              required
            />
          </label>

          <label className="block text-sm font-medium text-[#29483b]">
            Senha

            <input
              className={fieldClassName}
              type="password"
              name="senha"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              required
            />
          </label>

          {error && (
            <p
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}

          {/* BOTÃO */}
          <button
            className="w-full rounded-full bg-[#247253] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#1d6045] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#247253] disabled:cursor-wait disabled:opacity-65"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* CADASTRO */}
        <div className="mt-10 border-t border-[#e6ece7] pt-7 text-center">
          <p className="text-sm text-[#718078]">
            Ainda não tem uma conta?
          </p>

          <Link
            className="mt-3 inline-block text-sm font-semibold text-[#247253] hover:underline"
            href="/cadastro"
          >
            Criar uma conta
          </Link>
        </div>

      </section>

    </main>
  );
}