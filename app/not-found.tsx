import Link from "next/link";
import { classesBotao } from "@/components/ui/botao";

export default function NaoEncontrado() {
  return (
    <main className="grid min-h-[70dvh] place-items-center px-4">
      <div className="painel flex max-w-md flex-col items-center gap-2 p-8 text-center">
        <p className="text-[40px] font-bold tracking-tight text-ink-3">404</p>
        <h1 className="text-[18px] font-semibold">Não encontramos esta página</h1>
        <p className="text-[13.5px] text-ink-2">O registro pode ter sido removido, ou o endereço está incompleto.</p>
        <Link href="/sistema" className={classesBotao("secundario", "md", "mt-3")}>
          Ir para o sistema
        </Link>
      </div>
    </main>
  );
}
