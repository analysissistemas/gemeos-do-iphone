import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/** Linha de passos: mostra onde o usuário está e o que falta. */
export function Passos({
  passos,
  atual,
  concluidos,
  aoClicar,
  className,
}: {
  passos: readonly string[];
  atual: number;
  concluidos?: (i: number) => boolean;
  aoClicar?: (i: number) => void;
  className?: string;
}) {
  return (
    <ol className={cn("rolagem-fina flex gap-1 overflow-x-auto pb-1", className)}>
      {passos.map((p, i) => {
        const feito = concluidos ? concluidos(i) : i < atual;
        const ativo = i === atual;
        return (
          <li key={p} className="shrink-0">
            <button
              type="button"
              disabled={!aoClicar}
              onClick={() => aoClicar?.(i)}
              aria-current={ativo ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[12.5px] transition disabled:cursor-default",
                ativo ? "border-ink bg-ink text-contra-ink" : feito ? "border-linha-forte text-ink" : "border-linha text-ink-3",
                aoClicar && !ativo && "hover:border-linha-forte",
              )}
            >
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-full text-[11px] font-semibold",
                  ativo ? "bg-contra-ink text-ink" : feito ? "bg-bom text-white" : "bg-trilho",
                )}
              >
                {feito && !ativo ? <Check className="size-3" /> : i + 1}
              </span>
              {p}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
