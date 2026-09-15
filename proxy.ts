import { NextResponse, type NextRequest } from "next/server";

/* Checagem otimista: sem cookie, nem tenta renderizar o sistema — manda para o
   login. A checagem de verdade (assinatura, usuário ativo, permissão) acontece
   no servidor, em lib/auth/dal.ts, em toda página e ação. */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("gm_sessao")) {
    const url = new URL("/login", request.url);
    const destino = request.nextUrl.pathname + request.nextUrl.search;
    if (destino !== "/sistema") url.searchParams.set("de", destino);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/sistema/:path*"] };
