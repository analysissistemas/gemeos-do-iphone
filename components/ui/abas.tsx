"use client";
import { cn } from "@/lib/cn";

export function Abas<T extends string>({
  abas,
  atual,
  aoMudar,
  className,
}: {
  abas: { id: T; rotulo: string; contador?: number }[];
  atual: T;
  aoMudar: (id: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn("rolagem-fina -mx-1 flex gap-1 overflow-x-auto px-1 pb-1", className)}>
      {abas.map((a) => (
        <button
          key={a.id}
          role="tab"
          type="button"
          aria-selected={a.id === atual}
          onClick={() => aoMudar(a.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] transition",
            a.id === atual ? "bg-ink font-semibold text-contra-ink" : "text-ink-2 hover:bg-trilho hover:text-ink",
          )}
        >
          {a.rotulo}
          {a.contador ? (
            <span className={cn("num rounded-full px-1.5 text-[11px] leading-5", a.id === atual ? "bg-contra-ink/15" : "bg-trilho")}>{a.contador}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function LinhaDoTempo({ itens, vazio }: { itens: { id: string | number; titulo: React.ReactNode; detalhe?: React.ReactNode; quando: string; quem?: string | null }[]; vazio?: string }) {
  if (!itens.length) return <p className="py-6 text-center text-[13px] text-ink-3">{vazio ?? "Nada registrado ainda."}</p>;
  return (
    <ol className="relative flex flex-col gap-4 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-linha">
      {itens.map((i) => (
        <li key={i.id} className="relative pl-6">
          <span className="absolute left-0 top-1.5 size-[11px] rounded-full border-2 border-elevado bg-ink-3" aria-hidden />
          <p className="text-[13.5px] text-ink">{i.titulo}</p>
          {i.detalhe && <p className="mt-0.5 whitespace-pre-line text-[12.5px] leading-relaxed text-ink-2">{i.detalhe}</p>}
          <p className="mt-0.5 text-[11.5px] text-ink-3">
            {i.quando}
            {i.quem ? ` · ${i.quem}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}
