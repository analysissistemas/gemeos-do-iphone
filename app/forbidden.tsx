import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { classesBotao } from "@/components/ui/botao";

export default function AcessoNegado() {
  return (
    <main className="grid min-h-[70dvh] place-items-center px-4">
      <div className="painel flex max-w-md flex-col items-center gap-2 p-8 text-center">
        <span className="mb-1 grid size-12 place-items-center rounded-2xl bg-trilho text-ink-2">
          <LockKeyhole className="size-5" />
        </span>
        <h1 className="text-[18px] font-semibold">Seu perfil não tem acesso a esta área</h1>
        <p className="text-[13.5px] text-ink-2">Se você precisa dela para trabalhar, peça ao administrador para ajustar seu perfil de acesso.</p>
        <Link href="/sistema" className={classesBotao("secundario", "md", "mt-3")}>
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
