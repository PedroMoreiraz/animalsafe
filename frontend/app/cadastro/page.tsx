"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const fieldClassName =
  "mt-2 w-full rounded-full border border-[#d6ded8] bg-white px-5 py-3.5 text-sm text-[#17352b] outline-none transition placeholder:text-[#9aaa9f] focus:border-[#247253] focus:ring-2 focus:ring-[#247253]/10";

export default function CadastroPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const senha = String(formData.get("senha"));

    if (senha !== formData.get("confirmarSenha")) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          primeiroNome: formData.get("primeiroNome"),
          sobrenome: formData.get("sobrenome"),
          email: formData.get("email"),
          cpf: formData.get("cpf"),
          telefone: formData.get("telefone"),
          senha,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          result?.message ??
            "Não foi possível criar sua conta. Tente novamente."
        );
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
    <main className="min-h-screen bg-white px-6 py-12">

      <section className="mx-auto w-full max-w-[560px]">

        {/* TÍTULO */}
        <div className="mt-12">
          <p className="text-sm font-medium text-[#247253]">
            Faça parte dessa rede de cuidado
          </p>

          <h1 className="mt-3 text-[34px] font-semibold leading-tight tracking-tight text-[#17352b]">
            Crie sua conta.
          </h1>

          <p className="mt-3 text-[15px] leading-6 text-[#718078]">
            Preencha seus dados para começar a proteger e acompanhar os animais.
          </p>
        </div>

        {/* FORMULÁRIO */}
        <form
          className="mt-10 grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2"
          onSubmit={handleSubmit}
        >

          <label className="block text-sm font-medium text-[#29483b]">
            Nome

            <input
              className={fieldClassName}
              type="text"
              name="primeiroNome"
              autoComplete="given-name"
              placeholder="Seu nome"
              maxLength={60}
              required
            />
          </label>

          <label className="block text-sm font-medium text-[#29483b]">
            Sobrenome

            <input
              className={fieldClassName}
              type="text"
              name="sobrenome"
              autoComplete="family-name"
              placeholder="Seu sobrenome"
              maxLength={80}
              required
            />
          </label>

          <label className="block text-sm font-medium text-[#29483b]">
            Nome de usuário

            <input
              className={fieldClassName}
              type="text"
              name="username"
              autoComplete="username"
              placeholder="Seu usuário"
              minLength={3}
              maxLength={30}
              required
            />
          </label>

          <label className="block text-sm font-medium text-[#29483b]">
            E-mail

            <input
              className={fieldClassName}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="voce@email.com"
              maxLength={254}
              required
            />
          </label>

          <label className="block text-sm font-medium text-[#29483b]">
            CPF

            <input
              className={fieldClassName}
              type="text"
              name="cpf"
              autoComplete="off"
              inputMode="numeric"
              placeholder="Seu CPF"
              maxLength={14}
              required
            />
          </label>

          <label className="block text-sm font-medium text-[#29483b]">
            Telefone

            <input
              className={fieldClassName}
              type="tel"
              name="telefone"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              maxLength={20}
              required
            />
          </label>

          <label className="block text-sm font-medium text-[#29483b]">
            Senha

            <input
              className={fieldClassName}
              type="password"
              name="senha"
              autoComplete="new-password"
              placeholder="Mínimo de 8 caracteres"
              minLength={8}
              maxLength={128}
              required
            />
          </label>

          <label className="block text-sm font-medium text-[#29483b]">
            Confirmar senha

            <input
              className={fieldClassName}
              type="password"
              name="confirmarSenha"
              autoComplete="new-password"
              placeholder="Repita sua senha"
              minLength={8}
              maxLength={128}
              required
            />
          </label>

          {/* ERRO */}
          {error && (
            <p
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2"
              role="alert"
            >
              {error}
            </p>
          )}

          {/* BOTÃO */}
          <button
            className="w-full rounded-full bg-[#247253] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#1d6045] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#247253] disabled:cursor-wait disabled:opacity-65 sm:col-span-2"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </button>

        </form>

        {/* LOGIN */}
        <div className="mt-10 border-t border-[#e6ece7] pt-7 text-center">
          <p className="text-sm text-[#718078]">
            Já tem uma conta?
          </p>

          <Link
            className="mt-3 inline-block text-sm font-semibold text-[#247253] hover:underline"
            href="/login"
          >
            Entrar na minha conta
          </Link>
        </div>

      </section>

    </main>
  );
}