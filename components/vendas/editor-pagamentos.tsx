"use client";
import { Plus, Trash } from "lucide-react";
import { FORMAS_PAGAMENTO, type FormaPagamento } from "@/lib/dominio";
import { brl } from "@/lib/formato";
import { cn } from "@/lib/cn";
import { Botao } from "@/components/ui/botao";
import { CampoDinheiro, Entrada, Selecao } from "@/components/ui/campos";

export type Pagamento = { forma: FormaPagamento; valor: number | null; entrada: boolean; instituicao?: string | null; observacao?: string | null };

/* Pagamento dividido: soma ao vivo, mostra quanto falta ou passa.
   Sem parcelas e sem "a receber": a loja não trabalha com isso. */
export function EditorPagamentos({
  valorVenda,
  pagamentos,
  aoMudar,
  desabilitado,
}: {
  valorVenda: number | null;
  pagamentos: Pagamento[];
  aoMudar: (p: Pagamento[]) => void;
  desabilitado?: boolean;
}) {
  const soma = pagamentos.reduce((s, p) => s + (p.valor ?? 0), 0);
  const diferenca = valorVenda != null ? Math.round((valorVenda - soma) * 100) / 100 : null;
  const muda = (i: number, x: Partial<Pagamento>) => aoMudar(pagamentos.map((p, j) => (j === i ? { ...p, ...x } : p)));

  return (
    <div className="flex flex-col gap-3">
      {pagamentos.map((p, i) => (
        <div key={i} className="grid grid-cols-1 gap-2 rounded-2xl border border-linha p-3 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-center">
          <Selecao aria-label="Forma de pagamento" value={p.forma} disabled={desabilitado} onChange={(e) => muda(i, { forma: e.target.value as FormaPagamento })}>
            {Object.entries(FORMAS_PAGAMENTO).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Selecao>
          <CampoDinheiro aria-label="Valor do pagamento" valor={p.valor} disabled={desabilitado} aoMudar={(v) => muda(i, { valor: v })} />
          {p.forma === "financiamento" || p.forma === "troca" || p.forma === "outro" ? (
            <Entrada
              aria-label={p.forma === "financiamento" ? "Banco ou financeira" : "Descrição"}
              placeholder={p.forma === "financiamento" ? "Banco / financeira" : p.forma === "troca" ? "Veículo recebido" : "Descrição"}
              value={p.forma === "financiamento" ? (p.instituicao ?? "") : (p.observacao ?? "")}
              disabled={desabilitado}
              onChange={(e) => muda(i, p.forma === "financiamento" ? { instituicao: e.target.value } : { observacao: e.target.value })}
            />
          ) : (
            <label className="flex h-10 items-center gap-2 text-[13px] text-ink-2">
              <input type="checkbox" className="size-4 accent-[var(--ink)]" checked={p.entrada} disabled={desabilitado} onChange={(e) => muda(i, { entrada: e.target.checked })} />
              É a entrada
            </label>
          )}
          <Botao
            type="button"
            variante="fantasma"
            tamanho="icone"
            disabled={desabilitado || pagamentos.length === 1}
            onClick={() => aoMudar(pagamentos.filter((_, j) => j !== i))}
            aria-label="Remover pagamento"
          >
            <Trash className="size-4" />
          </Botao>
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Botao
          type="button"
          tamanho="sm"
          disabled={desabilitado}
          onClick={() => aoMudar([...pagamentos, { forma: "pix", valor: diferenca && diferenca > 0 ? diferenca : null, entrada: false }])}
        >
          <Plus className="size-4" /> Adicionar forma de pagamento
        </Botao>
        <div className="text-right text-[13px]">
          <p className="num text-ink-2">
            Total informado: <b className="text-ink">{brl(soma, 2)}</b>
          </p>
          {diferenca != null && (
            <p className={cn("num font-semibold", diferenca === 0 ? "text-bom" : "text-critico")} role="status">
              {diferenca === 0 ? "Confere com o valor vendido" : diferenca > 0 ? `Faltam ${brl(diferenca, 2)}` : `Passou ${brl(-diferenca, 2)}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
