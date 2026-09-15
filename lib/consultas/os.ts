import "server-only";
import { and, asc, desc, eq, gte, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, schema } from "@/lib/db";

export async function listarOs(f: { tipo?: string; tecnicoId?: number; q?: string }) {
  const o = schema.ordensServico;
  const tec = alias(schema.usuarios, "tec");
  const termo = f.q?.trim();
  return db
    .select({
      id: o.id,
      tipo: o.tipo,
      status: o.status,
      cliente: schema.clientes.nome,
      clienteId: o.clienteId,
      veiculoDescricao: o.veiculoDescricao,
      placa: o.placa,
      problemaRelatado: o.problemaRelatado,
      tecnico: tec.nome,
      unidade: schema.unidades.nome,
      canalRecebimento: o.canalRecebimento,
      abertaEm: o.abertaEm,
      previsaoEntrega: o.previsaoEntrega,
      atualizadoEm: o.atualizadoEm,
      itens: sql<number>`(select count(*)::int from os_itens i where i.os_id = ${o.id})`,
    })
    .from(o)
    .innerJoin(schema.clientes, eq(schema.clientes.id, o.clienteId))
    .leftJoin(tec, eq(tec.id, o.tecnicoId))
    .leftJoin(schema.unidades, eq(schema.unidades.id, o.unidadeId))
    .where(
      and(
        or(sql`${o.status} not in ('entregue','cancelada')`, gte(o.atualizadoEm, sql`now() - interval '30 days'`)),
        f.tipo ? eq(o.tipo, f.tipo) : undefined,
        f.tecnicoId ? eq(o.tecnicoId, f.tecnicoId) : undefined,
        termo
          ? or(
              sql`${schema.clientes.nome} ilike ${"%" + termo + "%"}`,
              sql`${o.veiculoDescricao} ilike ${"%" + termo + "%"}`,
              sql`${o.placa} ilike ${"%" + termo.replace(/[^a-zA-Z0-9]/g, "") + "%"}`,
              sql`${o.id}::text = ${termo.replace(/\D/g, "") || "0"}`,
            )
          : undefined,
      ),
    )
    .orderBy(asc(o.abertaEm))
    .limit(400);
}
export type LinhaOs = Awaited<ReturnType<typeof listarOs>>[number];

export async function obterOs(id: number) {
  const o = schema.ordensServico;
  const abriu = alias(schema.usuarios, "abriu");
  const recebeu = alias(schema.usuarios, "recebeu");
  const tec = alias(schema.usuarios, "tec");
  const finalizou = alias(schema.usuarios, "finalizou");
  const entregou = alias(schema.usuarios, "entregou");
  const [l] = await db
    .select({
      os: o,
      cliente: { id: schema.clientes.id, nome: schema.clientes.nome, cpf: schema.clientes.cpf, whatsapp: schema.clientes.whatsapp, telefone: schema.clientes.telefone },
      unidade: schema.unidades.nome,
      abriu: abriu.nome,
      recebeu: recebeu.nome,
      tecnico: tec.nome,
      finalizou: finalizou.nome,
      entregou: entregou.nome,
    })
    .from(o)
    .innerJoin(schema.clientes, eq(schema.clientes.id, o.clienteId))
    .leftJoin(schema.unidades, eq(schema.unidades.id, o.unidadeId))
    .leftJoin(abriu, eq(abriu.id, o.abertaPor))
    .leftJoin(recebeu, eq(recebeu.id, o.recebidaPor))
    .leftJoin(tec, eq(tec.id, o.tecnicoId))
    .leftJoin(finalizou, eq(finalizou.id, o.finalizadaPor))
    .leftJoin(entregou, eq(entregou.id, o.entreguePor))
    .where(eq(o.id, id))
    .limit(1);
  if (!l) return null;
  const u = schema.usuarios;
  const [itens, eventos] = await Promise.all([
    db.select().from(schema.osItens).where(eq(schema.osItens.osId, id)).orderBy(schema.osItens.id),
    db
      .select({ id: schema.osEventos.id, descricao: schema.osEventos.descricao, criadoEm: schema.osEventos.criadoEm, usuario: u.nome })
      .from(schema.osEventos)
      .leftJoin(u, eq(u.id, schema.osEventos.usuarioId))
      .where(eq(schema.osEventos.osId, id))
      .orderBy(desc(schema.osEventos.criadoEm)),
  ]);
  return { ...l, itens, eventos };
}
export type DetalheOs = NonNullable<Awaited<ReturnType<typeof obterOs>>>;

/** Veículos que o cliente comprou na loja — atalho para abrir OS de garantia. */
export async function veiculosDoCliente(clienteId: number) {
  const v = schema.veiculos;
  return db
    .select({
      vendaId: schema.vendas.id,
      veiculoId: v.id,
      descricao: sql<string>`concat_ws(' ', ${v.marca}, ${v.modelo}, ${v.cor}, ${v.anoModelo})`,
      placa: v.placa,
      chassi: v.chassi,
      km: v.km,
      finalizadaEm: schema.vendas.finalizadaEm,
    })
    .from(schema.vendas)
    .innerJoin(v, eq(v.id, schema.vendas.veiculoId))
    .where(and(eq(schema.vendas.clienteId, clienteId), eq(schema.vendas.status, "finalizada")))
    .orderBy(desc(schema.vendas.finalizadaEm));
}
