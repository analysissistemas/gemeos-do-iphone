import { cn } from "@/lib/cn";

/* Barras horizontais: magnitude por categoria.
   Marca fina (10px), ponta arredondada, rótulo e valor em cor de texto —
   a cor fica só na barra. Sem eixo: o valor já está escrito na ponta. */
export function BarrasHorizontais({
  itens,
  formatar = (v) => v.toLocaleString("pt-BR"),
  cor = "var(--ink-2)",
  vazio = "Sem dados no período",
  className,
}: {
  itens: { rotulo: string; valor: number; detalhe?: string; cor?: string }[];
  formatar?: (v: number) => string;
  cor?: string;
  vazio?: string;
  className?: string;
}) {
  const max = Math.max(0, ...itens.map((i) => i.valor));
  if (!itens.length || max === 0) return <p className="py-8 text-center text-[13px] text-ink-3">{vazio}</p>;
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {itens.map((i) => (
        <li key={i.rotulo} title={`${i.rotulo}: ${formatar(i.valor)}${i.detalhe ? ` · ${i.detalhe}` : ""}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
            <span className="truncate text-ink">{i.rotulo}</span>
            <span className="num shrink-0 font-semibold text-ink">
              {formatar(i.valor)}
              {i.detalhe && <span className="ml-1.5 font-normal text-ink-3">{i.detalhe}</span>}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-trilho">
            <div className="h-full rounded-r-[4px] rounded-l-full transition-[width]" style={{ width: `${Math.max(2, (i.valor / max) * 100)}%`, background: i.cor ?? cor }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
