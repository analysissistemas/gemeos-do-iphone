import type { Metadata } from "next";
import Image from "next/image";
import { eq } from "drizzle-orm";
import { BadgeCheck, CircleAlert } from "lucide-react";
import { db, schema } from "@/lib/db";
import type { SnapshotVenda } from "@/lib/servicos/vendas";
import { brl, dataHora } from "@/lib/formato";
import { FormularioAssinatura } from "./formulario";

export const metadata: Metadata = { title: "Assinatura do documento", robots: { index: false, follow: false } };

export default async function PaginaAssinatura({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const valido = /^[A-Za-z0-9_-]{30,60}$/.test(token);
  const [a] = valido ? await db.select().from(schema.assinaturas).where(eq(schema.assinaturas.token, token)).limit(1) : [];
  const [venda] = a?.documentoTipo === "venda" ? await db.select().from(schema.vendas).where(eq(schema.vendas.id, a.documentoId)).limit(1) : [];
  const s = venda?.documentoSnapshot as unknown as SnapshotVenda | undefined;

  let aviso: { titulo: string; texto: string; ok?: boolean } | null = null;
  if (!a || !venda || !s || a.status === "cancelado") aviso = { titulo: "Link inválido", texto: "Este link não é mais válido. Peça um novo à Gêmeos Motors." };
  else if (a.status === "assinado") aviso = { titulo: "Documento assinado", texto: `Assinado por ${a.assinanteNome} em ${dataHora(a.assinadoEm)}. Obrigado!`, ok: true };
  else if (a.expiraEm && a.expiraEm < new Date()) aviso = { titulo: "Link expirado", texto: "Peça um novo link à Gêmeos Motors." };
  else if (venda.documentoHash !== a.documentoHash) aviso = { titulo: "Documento atualizado", texto: "A loja alterou este documento. Peça o link novo." };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-5 px-4 py-6">
      <header className="flex items-center justify-between">
        <span className="rounded-xl bg-black px-2 py-1.5">
          <Image src="/fotos/logo-gemeos-motors.webp" alt="Gêmeos Motors" width={110} height={55} className="h-8 w-auto" priority />
        </span>
        <span className="text-[12px] text-ink-3">Assinatura de documento</span>
      </header>

      {aviso ? (
        <div className="painel flex flex-col items-center gap-2 p-8 text-center">
          {aviso.ok ? <BadgeCheck className="size-8 text-bom" /> : <CircleAlert className="size-8 text-serio" />}
          <h1 className="text-[20px] font-bold">{aviso.titulo}</h1>
          <p className="text-[14px] text-ink-2">{aviso.texto}</p>
          {aviso.ok && (
            <a className="mt-3 text-[14px] font-semibold underline" href={`/api/assinatura/${token}/documento`} target="_blank" rel="noreferrer">
              Ver documento assinado (PDF)
            </a>
          )}
        </div>
      ) : (
        s && (
          <>
            <section className="painel p-5">
              <p className="text-[12px] uppercase tracking-wide text-ink-3">{s.numero} · Termo de venda de veículo</p>
              <h1 className="mt-1 text-[20px] font-bold leading-tight">
                {[s.veiculo.marca, s.veiculo.modelo].filter(Boolean).join(" ")}
                {s.veiculo.cor ? ` · ${s.veiculo.cor}` : ""}
              </h1>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[14px]">
                <div>
                  <dt className="text-[12px] text-ink-3">Comprador</dt>
                  <dd>{s.cliente.nome}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-ink-3">Condição</dt>
                  <dd>
                    {s.veiculo.condicao}
                    {s.veiculo.km != null ? ` · ${s.veiculo.km.toLocaleString("pt-BR")} km` : ""}
                  </dd>
                </div>
                {s.veiculo.chassi && (
                  <div>
                    <dt className="text-[12px] text-ink-3">Chassi</dt>
                    <dd className="break-all">{s.veiculo.chassi}</dd>
                  </div>
                )}
                {s.veiculo.placa && (
                  <div>
                    <dt className="text-[12px] text-ink-3">Placa</dt>
                    <dd>{s.veiculo.placa}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[12px] text-ink-3">Valor anunciado</dt>
                  <dd className="num">{brl(s.valores.anunciado, 2)}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-ink-3">Valor negociado</dt>
                  <dd className="num text-[17px] font-bold">{brl(s.valores.vendido, 2)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-[12px] text-ink-3">Pagamento</p>
              <ul className="mt-1 flex flex-col gap-1 text-[14px]">
                {s.pagamentos.map((p, i) => (
                  <li key={i} className="num flex justify-between gap-3">
                    <span>
                      {p.forma}
                      {p.entrada ? " (entrada)" : ""}
                      {p.detalhe ? ` · ${p.detalhe}` : ""}
                    </span>
                    <span>{brl(p.valor, 2)}</span>
                  </li>
                ))}
              </ul>
              {(s.condicoesPadrao || s.condicoes) && (
                <details className="mt-4 text-[13px] text-ink-2">
                  <summary className="cursor-pointer font-semibold text-ink">Condições da venda</summary>
                  {s.condicoesPadrao && <p className="mt-2 leading-relaxed">{s.condicoesPadrao}</p>}
                  {s.condicoes && <p className="mt-2 leading-relaxed">{s.condicoes}</p>}
                </details>
              )}
              <a className="mt-4 inline-block text-[14px] font-semibold underline" href={`/api/assinatura/${token}/documento`} target="_blank" rel="noreferrer">
                Ler o documento completo (PDF)
              </a>
            </section>
            <FormularioAssinatura token={token} nomeSugerido={s.cliente.nome} />
          </>
        )
      )}
    </main>
  );
}
