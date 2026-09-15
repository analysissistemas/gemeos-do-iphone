import type { Metadata } from "next";
import Link from "next/link";
import { sql } from "drizzle-orm";
import { Wallet } from "lucide-react";
import { exigirPermissao } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { intervalo, type Periodo } from "@/lib/consultas/painel";
import { FORMAS_PAGAMENTO } from "@/lib/dominio";
import { brl, data, numeroDoc } from "@/lib/formato";
import { cn } from "@/lib/cn";
import { Pagina } from "@/components/ui/pagina";
import { CabecalhoPagina, EstadoVazio, Painel, TituloSecao } from "@/components/ui/basicos";
import { BarrasHorizontais } from "@/components/graficos/barras";

export const metadata: Metadata = { title: "Financeiro" };

/* Entradas registradas nas vendas finalizadas e nas OS entregues.
   Sem contas a receber e sem parcelas: a loja não trabalha com isso. */
export default async function PaginaFinanceiro({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  await exigirPermissao("financeiro.ver");
  const b = await searchParams;
  const periodo = (["7d", "30d", "mes"].includes(b.periodo ?? "") ? b.periodo : "mes") as Periodo;
  const { inicio, fim, rotulo } = intervalo(periodo);
  const ini = inicio.toISOString();
  const fi = fim.toISOString();
  const exec = async <T,>(q: ReturnType<typeof sql>) => (await db.execute(q)).rows as T[];

  const [formas, vendas, os, [totais]] = await Promise.all([
    exec<{ forma: string; total: number; qtd: number }>(sql`
      select p.forma, coalesce(sum(p.valor),0)::float as total, count(distinct v.id)::int as qtd
      from venda_pagamentos p join vendas v on v.id = p.venda_id
      where v.status = 'finalizada' and v.finalizada_em >= ${ini} and v.finalizada_em < ${fi}
      group by p.forma order by total desc`),
    exec<{ id: number; cliente: string; veiculo: string | null; valor: number; custo: number | null; finalizada_em: string }>(sql`
      select v.id, c.nome as cliente, concat_ws(' ', ve.marca, ve.modelo) as veiculo, v.valor_vendido::float as valor, ve.custo::float as custo, v.finalizada_em
      from vendas v join clientes c on c.id = v.cliente_id left join veiculos ve on ve.id = v.veiculo_id
      where v.status = 'finalizada' and v.finalizada_em >= ${ini} and v.finalizada_em < ${fi}
      order by v.finalizada_em desc`),
    exec<{ total: number; qtd: number }>(sql`
      select coalesce(sum(i.quantidade * i.valor_unitario),0)::float as total, count(distinct o.id)::int as qtd
      from ordens_servico o join os_itens i on i.os_id = o.id
      where o.status = 'entregue' and o.entregue_em >= ${ini} and o.entregue_em < ${fi}`),
    exec<{ faturamento: number; custo: number; semCusto: number }>(sql`
      select coalesce(sum(v.valor_vendido),0)::float as faturamento,
        coalesce(sum(ve.custo) filter (where ve.custo is not null),0)::float as custo,
        count(*) filter (where ve.custo is null)::int as "semCusto"
      from vendas v left join veiculos ve on ve.id = v.veiculo_id
      where v.status = 'finalizada' and v.finalizada_em >= ${ini} and v.finalizada_em < ${fi}`),
  ]);
  const lucro = vendas.filter((v) => v.custo != null).reduce((s, v) => s + (v.valor - (v.custo ?? 0)), 0);
  const faturamentoComCusto = vendas.filter((v) => v.custo != null).reduce((s, v) => s + v.valor, 0);

  return (
    <Pagina>
      <CabecalhoPagina
        titulo="Financeiro"
        subtitulo={`${rotulo} · entradas das vendas finalizadas e das ordens de serviço entregues`}
        acoes={
          <div className="flex gap-1.5">
            {[["mes", "Este mês"], ["30d", "30 dias"], ["7d", "7 dias"]].map(([id, r]) => (
              <Link key={id} href={`/sistema/financeiro?periodo=${id}`} className={cn("rounded-full border px-3 py-1.5 text-[12.5px]", periodo === id ? "border-ink bg-ink text-contra-ink" : "border-linha text-ink-2")}>
                {r}
              </Link>
            ))}
          </div>
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Painel className="p-4">
          <p className="text-[12px] text-ink-3">Vendas de veículos</p>
          <p className="num mt-1 text-[24px] font-bold">{brl(totais.faturamento)}</p>
          <p className="text-[12px] text-ink-2">{vendas.length} venda(s)</p>
        </Painel>
        <Painel className="p-4">
          <p className="text-[12px] text-ink-3">Assistência (OS entregues)</p>
          <p className="num mt-1 text-[24px] font-bold">{brl(os[0].total)}</p>
          <p className="text-[12px] text-ink-2">{os[0].qtd} OS</p>
        </Painel>
        <Painel className="p-4">
          <p className="text-[12px] text-ink-3">Lucro bruto nas vendas</p>
          <p className="num mt-1 text-[24px] font-bold">{faturamentoComCusto ? brl(lucro) : "—"}</p>
          <p className="text-[12px] text-ink-2">{totais.semCusto ? `${totais.semCusto} venda(s) sem custo cadastrado` : faturamentoComCusto ? `Margem ${Math.round((lucro / faturamentoComCusto) * 100)}%` : "Cadastre o custo no estoque"}</p>
        </Painel>
        <Painel className="p-4">
          <p className="text-[12px] text-ink-3">Entrada total</p>
          <p className="num mt-1 text-[24px] font-bold">{brl(totais.faturamento + os[0].total)}</p>
        </Painel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Painel className="p-5">
          <TituloSecao>Recebido por forma de pagamento</TituloSecao>
          <BarrasHorizontais itens={formas.map((f) => ({ rotulo: FORMAS_PAGAMENTO[f.forma as keyof typeof FORMAS_PAGAMENTO] ?? f.forma, valor: f.total, detalhe: `${f.qtd} venda(s)` }))} formatar={(v) => brl(v)} cor="var(--marca)" vazio="Nenhum pagamento no período." />
        </Painel>
        <Painel className="overflow-hidden lg:col-span-2">
          <p className="border-b border-linha px-5 py-3 text-[15px] font-semibold">Vendas finalizadas</p>
          {vendas.length === 0 ? (
            <EstadoVazio compacto icone={<Wallet />} titulo="Nenhuma venda finalizada no período" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-[13.5px]">
                <thead className="text-left text-[11.5px] uppercase tracking-wide text-ink-3">
                  <tr className="border-b border-linha">
                    <th className="px-5 py-2.5 font-medium">Venda</th>
                    <th className="px-3 py-2.5 font-medium">Cliente / veículo</th>
                    <th className="px-3 py-2.5 text-right font-medium">Valor</th>
                    <th className="px-3 py-2.5 text-right font-medium">Custo</th>
                    <th className="px-5 py-2.5 text-right font-medium">Lucro</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map((v) => (
                    <tr key={v.id} className="border-b border-linha last:border-0">
                      <td className="px-5 py-2.5">
                        <Link href={`/sistema/vendas/${v.id}`} className="num hover:underline">
                          {numeroDoc("V", v.id)}
                        </Link>
                        <span className="block text-[12px] text-ink-3">{data(v.finalizada_em)}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        {v.cliente}
                        <span className="block text-[12px] text-ink-3">{v.veiculo}</span>
                      </td>
                      <td className="num px-3 py-2.5 text-right font-semibold">{brl(v.valor)}</td>
                      <td className="num px-3 py-2.5 text-right text-ink-2">{v.custo != null ? brl(v.custo) : "—"}</td>
                      <td className="num px-5 py-2.5 text-right">{v.custo != null ? brl(v.valor - v.custo) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Painel>
      </div>
    </Pagina>
  );
}
