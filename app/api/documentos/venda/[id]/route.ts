import { NextResponse, type NextRequest } from "next/server";
import { obterUsuario } from "@/lib/auth/dal";
import { pode } from "@/lib/dominio";
import { pdfDaVenda, respostaPdf } from "@/lib/pdf/gerar";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const u = await obterUsuario();
  if (!u) return NextResponse.redirect(new URL("/login", req.url));
  if (!pode(u.papel, "vendas.ver")) return NextResponse.json({ erro: "Sem acesso a vendas" }, { status: 403 });
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ erro: "Venda inválida" }, { status: 400 });
  const pdf = await pdfDaVenda(id);
  if (!pdf) return NextResponse.json({ erro: "O documento desta venda ainda não foi gerado." }, { status: 409 });
  return respostaPdf(pdf.buffer, pdf.nome, req.nextUrl.searchParams.has("baixar"));
}
