
"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      try {
        const resposta = await fetch(`${API_URL}/perfil`, {
          method: "GET",
          credentials: "include",
        });

        if (!ativo) return;

        if (resposta.ok) {
          router.replace("/home");
        } else {
          router.replace("/login");
        }
      } catch (error) {
        if (ativo) {
          router.replace("/login");
        }
      }
    }

    const timer = setTimeout(verificarSessao, 1800);

    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <main className="min-h-screen w-full bg-white flex flex-col items-center justify-center relative overflow-hidden">

      <div className="flex flex-col items-center">
        <Image
          src="/logo/logo.png"
          alt="Animal Safety"
          width={240}
          height={140}
          priority
          className="object-contain w-[220px] h-auto"
        />

        <div className="flex items-center gap-2 mt-7">
          <span className="w-2 h-2 rounded-full bg-[#64763D] animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-[#64763D] animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-[#64763D] animate-bounce [animation-delay:300ms]" />
        </div>
      </div>

    </main>
  );
}