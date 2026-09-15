import { NextResponse, type NextRequest } from "next/server";
import { obterUsuario } from "@/lib/auth/dal";
import { pode } from "@/lib/dominio";
import { registrarLog } from "@/lib/logs";
import { pdfDaOs, respostaPdf } from "@/lib/pdf/gerar";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const u = await obterUsuario();
  if (!u) return NextResponse.redirect(new URL("/login", req.url));
  if (!pode(u.papel, "os.ver")) return NextResponse.json({ erro: "Sem acesso à assistência" }, { status: 403 });
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ erro: "OS inválida" }, { status: 400 });
  const pdf = await pdfDaOs(id);
  if (!pdf) return NextResponse.json({ erro: "OS não encontrada" }, { status: 404 });
  await registrarLog(u, { acao: "documento.gerado", entidade: "os", entidadeId: id, descricao: `Gerou o PDF da ${pdf.nome.replace(".pdf", "")}` });
  return respostaPdf(pdf.buffer, pdf.nome, req.nextUrl.searchParams.has("baixar"));
}
