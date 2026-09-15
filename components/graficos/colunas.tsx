"use client";
import { useState } from "react";
import { brl } from "@/lib/formato";

/* Colunas no tempo (faturamento por dia/semana). Uma série só: sem legenda,
   o título do painel diz o que é. Grade recessiva, 3 marcas no eixo, dica ao
   passar o mouse ou tocar. Coluna com no máximo 24px e 4px arredondado na ponta. */
export function ColunasTempo({ pontos, semana }: { pontos: { periodo: string; vendas: number; faturamento: number }[]; semana?: boolean }) {
  const [ativo, setAtivo] = useState<number | null>(null);
  const L = 640;
  const A = 220;
  const margem = { t: 12, r: 8, b: 26, l: 52 };
  const larg = L - margem.l - margem.r;
  const alt = A - margem.t - margem.b;
  const max = Math.max(...pontos.map((p) => p.faturamento), 0);
  const topo = max === 0 ? 1000 : Math.ceil(max / Math.pow(10, Math.floor(Math.log10(max)))) * Math.pow(10, Math.floor(Math.log10(max)));
  const faixa = larg / Math.max(1, pontos.length);
  const barra = Math.min(24, Math.max(3, faixa - 4));
  const y = (v: number) => margem.t + alt - (v / topo) * alt;
  const rotuloX = (s: string) => {
    const [, m, d] = s.split("-");
    return `${d}/${m}`;
  };
  const passoRotulo = Math.ceil(pontos.length / 8);
  const total = pontos.reduce((s, p) => s + p.faturamento, 0);

  if (total === 0) return <p className="py-14 text-center text-[13px] text-ink-3">Nenhuma venda finalizada no período.</p>;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${L} ${A}`} className="h-auto w-full" role="img" aria-label="Faturamento por período">
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={margem.l} x2={L - margem.r} y1={y(topo * f)} y2={y(topo * f)} stroke="var(--linha)" strokeWidth={1} />
            <text x={margem.l - 8} y={y(topo * f) + 4} textAnchor="end" fontSize={11} fill="var(--ink-3)">
              {topo * f >= 1000 ? `${Math.round((topo * f) / 1000)} mil` : Math.round(topo * f)}
            </text>
          </g>
        ))}
        {pontos.map((p, i) => {
          const cx = margem.l + faixa * i + faixa / 2;
          const h = Math.max(p.faturamento > 0 ? 2 : 0, alt - (y(p.faturamento) - margem.t));
          const r = Math.min(4, barra / 2, h);
          const x0 = cx - barra / 2;
          const yTopo = margem.t + alt - h;
          return (
            <g key={p.periodo} onMouseEnter={() => setAtivo(i)} onMouseLeave={() => setAtivo(null)} onClick={() => setAtivo(ativo === i ? null : i)}>
              <rect x={margem.l + faixa * i} y={margem.t} width={faixa} height={alt} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x0},${margem.t + alt} V${yTopo + r} Q${x0},${yTopo} ${x0 + r},${yTopo} H${x0 + barra - r} Q${x0 + barra},${yTopo} ${x0 + barra},${yTopo + r} V${margem.t + alt} Z`}
                  fill="var(--marca)"
                  opacity={ativo == null || ativo === i ? 1 : 0.45}
                />
              )}
              {i % passoRotulo === 0 && (
                <text x={cx} y={A - 8} textAnchor="middle" fontSize={10.5} fill="var(--ink-3)">
                  {rotuloX(p.periodo)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {ativo != null && pontos[ativo] && (
        <div
          className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-xl border border-linha-forte bg-elevado px-3 py-2 text-[12px] shadow-alta"
          style={{ left: `${((margem.l + faixa * ativo + faixa / 2) / L) * 100}%` }}
        >
          <p className="font-semibold">
            {semana ? "Semana de " : ""}
            {rotuloX(pontos[ativo].periodo)}
          </p>
          <p className="num">{brl(pontos[ativo].faturamento)}</p>
          <p className="text-ink-3">
            {pontos[ativo].vendas} {pontos[ativo].vendas === 1 ? "venda" : "vendas"}
          </p>
        </div>
      )}
    </div>
  );
}
