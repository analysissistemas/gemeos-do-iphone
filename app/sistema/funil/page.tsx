import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { exigirPermissao } from "@/lib/auth/dal";
import { listarNegociosFunil } from "@/lib/consultas/funil";
import { listarEquipe } from "@/lib/consultas/equipe";
import { db, schema } from "@/lib/db";
import { Pagina } from "@/components/ui/pagina";
import { QuadroFunil } from "./quadro";

export const metadata: Metadata = { title: "Funil de vendas" };

type Busca = { q?: string; resp?: string; dias?: string; novo?: string; negocio?: string };

export default async function PaginaFunil({ searchParams }: { searchParams: Promise<Busca> }) {
  const u = await exigirPermissao("funil.ver");
  const b = await searchParams;
  const dias = [7, 30, 90].includes(Number(b.dias)) ? Number(b.dias) : 30;
  const [cards, equipe, novoCliente] = await Promise.all([
    listarNegociosFunil({ q: b.q, responsavelId: b.resp ? Number(b.resp) : undefined, diasEncerrados: dias }),
    listarEquipe(),
    b.novo && Number(b.novo) > 0
      ? db.select({ id: schema.clientes.id, nome: schema.clientes.nome }).from(schema.clientes).where(eq(schema.clientes.id, Number(b.novo))).limit(1)
      : Promise.resolve([]),
  ]);
  return (
    <Pagina larga>
      <QuadroFunil
        cards={cards}
        equipe={equipe}
        usuarioId={u.id}
        filtros={{ q: b.q, resp: b.resp, dias: String(dias) }}
        novoCliente={novoCliente[0] ?? null}
        negocioInicial={b.negocio && Number(b.negocio) > 0 ? Number(b.negocio) : null}
      />
    </Pagina>
  );
}
