import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm";
import { ScrollText } from "lucide-react";
import { exigirPermissao } from "@/lib/auth/dal";
import { db, schema } from "@/lib/db";
import { dataHora } from "@/lib/formato";
import { Pagina } from "@/components/ui/pagina";
import { CabecalhoPagina, EstadoVazio, Painel } from "@/components/ui/basicos";
import { classesBotao } from "@/components/ui/botao";

export const metadata: Metadata = { title: "Histórico do sistema" };

const ENTIDADES: Record<string, string> = {
  cliente: "Clientes",
  negocio: "Negócios",
  venda: "Vendas",
  os: "Ordens de serviço",
  conversa: "Conversas",
  followup: "Follow-ups",
  veiculo: "Estoque",
  usuario: "Usuários e acesso",
  sistema: "Sistema",
  configuracao: "Configurações",
};
const LINKS: Record<string, (id: string) => string> = {
  cliente: (id) => `/sistema/clientes/${id}`,
  negocio: (id) => `/sistema/funil?negocio=${id}`,
  venda: (id) => `/sistema/vendas/${id}`,
  os: (id) => `/sistema/assistencia/${id}`,
  conversa: (id) => `/sistema/conversas?c=${id}`,
};
const POR_PAGINA = 50;

export default async function PaginaLogs({ searchParams }: { searchParams: Promise<{ entidade?: string; usuario?: string; de?: string; ate?: string; pagina?: string; q?: string }> }) {
  await exigirPermissao("logs.ver");
  const b = await searchParams;
  const pagina = Math.max(1, Number(b.pagina) || 1);
  const filtro = and(
    b.entidade && ENTIDADES[b.entidade] ? eq(schema.logs.entidade, b.entidade) : undefined,
    b.usuario ? eq(schema.logs.usuarioId, Number(b.usuario)) : undefined,
    b.de ? gte(schema.logs.criadoEm, new Date(`${b.de}T00:00:00-03:00`)) : undefined,
    b.ate ? lt(schema.logs.criadoEm, new Date(new Date(`${b.ate}T00:00:00-03:00`).getTime() + 86400000)) : undefined,
    b.q ? sql`${schema.logs.descricao} ilike ${"%" + b.q + "%"}` : undefined,
  );
  const [linhas, [{ total }], usuarios] = await Promise.all([
    db.select().from(schema.logs).where(filtro).orderBy(desc(schema.logs.criadoEm)).limit(POR_PAGINA).offset((pagina - 1) * POR_PAGINA),
    db.select({ total: sql<number>`count(*)::int` }).from(schema.logs).where(filtro),
    db.select({ id: schema.usuarios.id, nome: schema.usuarios.nome }).from(schema.usuarios).orderBy(asc(schema.usuarios.nome)),
  ]);
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const link = (p: number) => `/sistema/logs?${new URLSearchParams(Object.entries({ ...b, pagina: String(p) }).filter(([, v]) => v) as [string, string][])}`;

  return (
    <Pagina>
      <CabecalhoPagina titulo="Histórico do sistema" subtitulo={`${total.toLocaleString("pt-BR")} registro(s). Toda ação importante fica aqui, com quem fez e quando.`} />
      <form className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-6">
        <input name="q" defaultValue={b.q} placeholder="Buscar na descrição" className="col-span-2 h-10 rounded-full border border-linha bg-plano/60 px-4 text-[13.5px]" />
        <select name="entidade" defaultValue={b.entidade ?? ""} className="h-10 rounded-full border border-linha bg-plano/60 px-3 text-[13px]">
          <option value="">Tudo</option>
          {Object.entries(ENTIDADES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select name="usuario" defaultValue={b.usuario ?? ""} className="h-10 rounded-full border border-linha bg-plano/60 px-3 text-[13px]">
          <option value="">Todas as pessoas</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome}
            </option>
          ))}
        </select>
        <input type="date" name="de" defaultValue={b.de} aria-label="De" className="h-10 rounded-full border border-linha bg-plano/60 px-3 text-[13px]" />
        <div className="flex gap-2">
          <input type="date" name="ate" defaultValue={b.ate} aria-label="Até" className="h-10 min-w-0 flex-1 rounded-full border border-linha bg-plano/60 px-3 text-[13px]" />
          <button className={classesBotao("secundario")}>Filtrar</button>
        </div>
      </form>
      <Painel className="overflow-hidden">
        {linhas.length === 0 ? (
          <EstadoVazio icone={<ScrollText />} titulo="Nenhum registro com este filtro" />
        ) : (
          <ul>
            {linhas.map((l) => {
              const destino = l.entidadeId && LINKS[l.entidade] && !l.acao.startsWith("auth.") ? LINKS[l.entidade](l.entidadeId) : null;
              return (
                <li key={l.id} className="grid grid-cols-1 gap-1 border-b border-linha px-5 py-3 last:border-0 sm:grid-cols-[150px_1fr_auto] sm:items-center sm:gap-4">
                  <span className="num text-[12.5px] text-ink-3">{dataHora(l.criadoEm)}</span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px]">
                      <b>{l.usuarioNome ?? "Sistema"}</b> {destino ? (
                        <Link href={destino} className="hover:underline">
                          {l.descricao}
                        </Link>
                      ) : (
                        l.descricao
                      )}
                    </span>
                    <span className="text-[11.5px] text-ink-3">
                      {ENTIDADES[l.entidade] ?? l.entidade}
                      {l.entidadeId ? ` · nº ${l.entidadeId}` : ""} · {l.acao}
                      {l.origem !== "sistema" ? ` · origem: ${l.origem}` : ""}
                      {l.ip ? ` · IP ${l.ip}` : ""}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Painel>
      {paginas > 1 && (
        <nav className="mt-4 flex items-center justify-between text-[13px] text-ink-2">
          <span>
            Página {pagina} de {paginas}
          </span>
          <span className="flex gap-2">
            {pagina > 1 && (
              <Link href={link(pagina - 1)} className={classesBotao("secundario", "sm")}>
                Anterior
              </Link>
            )}
            {pagina < paginas && (
              <Link href={link(pagina + 1)} className={classesBotao("secundario", "sm")}>
                Próxima
              </Link>
            )}
          </span>
        </nav>
      )}
    </Pagina>
  );
}
