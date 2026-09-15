import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { and, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, schema } from "@/lib/db";
import type { SnapshotVenda } from "@/lib/servicos/vendas";
import { DocumentoVenda } from "./venda";

/** PDF da venda a partir da fotografia gravada na geração do documento. */
export async function pdfDaVenda(vendaId: number) {
  const [v] = await db.select().from(schema.vendas).where(eq(schema.vendas.id, vendaId)).limit(1);
  if (!v || !v.documentoSnapshot || !v.documentoHash) return null;
  const confirmador = alias(schema.usuarios, "confirmador");
  const [a] = await db
    .select({ assinatura: schema.assinaturas, confirmadoPor: confirmador.nome })
    .from(schema.assinaturas)
    .leftJoin(confirmador, eq(confirmador.id, schema.assinaturas.confirmadoPor))
    .where(
      and(
        eq(schema.assinaturas.documentoTipo, "venda"),
        eq(schema.assinaturas.documentoId, vendaId),
        eq(schema.assinaturas.status, "assinado"),
        eq(schema.assinaturas.documentoHash, v.documentoHash),
      ),
    )
    .orderBy(desc(schema.assinaturas.assinadoEm))
    .limit(1);
  const s = v.documentoSnapshot as unknown as SnapshotVenda;
  const buffer = await renderToBuffer(
    <DocumentoVenda
      s={s}
      hash={v.documentoHash}
      assinatura={a ? { ...a.assinatura, confirmadoPor: a.confirmadoPor } : null}
    />,
  );
  return { buffer, nome: `${s.numero}-termo-de-venda.pdf` };
}

export function respostaPdf(buffer: Buffer, nome: string, baixar: boolean) {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${baixar ? "attachment" : "inline"}; filename="${nome}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

/** PDF da ordem de serviço, sempre com os dados atuais da OS. */
export async function pdfDaOs(osId: number) {
  const { obterOs } = await import("@/lib/consultas/os");
  const { DocumentoOs } = await import("./os");
  const d = await obterOs(osId);
  if (!d) return null;
  const [emp] = await db.select().from(schema.empresa).where(eq(schema.empresa.id, 1)).limit(1);
  const buffer = await renderToBuffer(
    <DocumentoOs
      d={d}
      empresa={{
        nome: emp?.nomeFantasia ?? "Gêmeos Motors",
        cnpj: emp?.cnpj ?? null,
        endereco: [emp?.endereco, emp?.cidade, emp?.estado].filter(Boolean).join(" — ") || null,
        telefone: emp?.whatsapp ?? emp?.telefone ?? null,
        condicoesOs: emp?.condicoesOs ?? null,
      }}
    />,
  );
  return { buffer, nome: `OS-${String(osId).padStart(5, "0")}.pdf` };
}
