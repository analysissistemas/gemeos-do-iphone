import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { exigirPermissao } from "@/lib/auth/dal";
import { listarEquipe, listarUnidades } from "@/lib/consultas/equipe";
import { db, schema } from "@/lib/db";
import { Pagina } from "@/components/ui/pagina";
import { CabecalhoPagina } from "@/components/ui/basicos";
import { FormularioOs } from "./formulario";

export const metadata: Metadata = { title: "Abrir ordem de serviço" };

export default async function NovaOs({ searchParams }: { searchParams: Promise<{ cliente?: string }> }) {
  const u = await exigirPermissao("os.editar");
  const { cliente } = await searchParams;
  const [equipe, unidades, cli] = await Promise.all([
    listarEquipe(),
    listarUnidades(),
    cliente && Number(cliente) > 0
      ? db.select({ id: schema.clientes.id, nome: schema.clientes.nome }).from(schema.clientes).where(eq(schema.clientes.id, Number(cliente))).limit(1)
      : Promise.resolve([]),
  ]);
  return (
    <Pagina>
      <CabecalhoPagina titulo="Abrir ordem de serviço" subtitulo="Registre o que o cliente relatou. O diagnóstico técnico vem depois, no atendimento." />
      <FormularioOs equipe={equipe} unidades={unidades} clienteInicial={cli[0] ?? null} usuarioId={u.id} />
    </Pagina>
  );
}
