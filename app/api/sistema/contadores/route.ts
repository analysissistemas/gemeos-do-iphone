import { NextResponse } from "next/server";
import { obterUsuario } from "@/lib/auth/dal";
import { contarPendencias } from "@/lib/consultas/contadores";

export async function GET() {
  const u = await obterUsuario();
  if (!u) return NextResponse.json({ erro: "sessão expirada" }, { status: 401 });
  return NextResponse.json(await contarPendencias(u), { headers: { "Cache-Control": "no-store" } });
}
