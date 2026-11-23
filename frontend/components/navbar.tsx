
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PawPrint, Building2 } from "lucide-react";

const links = [
  {
    label: "Início",
    href: "/home",
    icon: Home,
  },
  {
    label: "Ocorrências",
    href: "/ocorrencias",
    icon: PawPrint,
  },
  {
    label: "Instituições",
    href: "/instituicoes",
    icon: Building2,
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-[#e6ece7] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around px-3 py-3">

        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-w-20 flex-col items-center gap-1 transition ${
                active
                  ? "text-[#247253]"
                  : "text-[#9aaa9f] hover:text-[#247253]"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />

              <span className={`text-[11px] ${
                active ? "font-semibold" : "font-medium"
              }`}>
                {link.label}
              </span>
            </Link>
          );
        })}

      </div>
    </nav>
  );
}
