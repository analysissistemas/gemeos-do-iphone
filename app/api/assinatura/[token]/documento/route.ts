import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { pdfDaVenda, respostaPdf } from "@/lib/pdf/gerar";

/* Rota pública: quem tem o link de assinatura pode ver o documento dele.
   O token é aleatório (256 bits) e só serve para aquele documento. */
export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{30,60}$/.test(token)) return NextResponse.json({ erro: "Link inválido" }, { status: 404 });
  const [a] = await db.select().from(schema.assinaturas).where(eq(schema.assinaturas.token, token)).limit(1);
  if (!a || a.status === "cancelado" || a.documentoTipo !== "venda") return NextResponse.json({ erro: "Link inválido" }, { status: 404 });
  const pdf = await pdfDaVenda(a.documentoId);
  if (!pdf) return NextResponse.json({ erro: "Documento indisponível" }, { status: 404 });
  return respostaPdf(pdf.buffer, pdf.nome, false);
}
