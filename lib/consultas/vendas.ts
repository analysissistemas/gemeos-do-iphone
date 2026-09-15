import "server-only";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, schema } from "@/lib/db";

export async function listarVendas(f: { status?: string; dias?: number }) {
  const v = schema.vendas;
  const vend = alias(schema.usuarios, "vend");
  const veic = schema.veiculos;
  return db
    .select({
      id: v.id,
      status: v.status,
      cliente: schema.clientes.nome,
      clienteId: v.clienteId,
      veiculo: sql<string | null>`case when ${veic.id} is null then null else concat_ws(' ', ${veic.marca}, ${veic.modelo}, ${veic.cor}) end`,
      vendedor: vend.nome,
      valorAnunciado: v.valorAnunciado,
      valorVendido: v.valorVendido,
      criadoEm: v.criadoEm,
      finalizadaEm: v.finalizadaEm,
      documentoGeradoEm: v.documentoGeradoEm,
      formas: sql<string | null>`(select string_agg(distinct p.forma, ',') from venda_pagamentos p where p.venda_id = ${v.id})`,
    })
    .from(v)
    .innerJoin(schema.clientes, eq(schema.clientes.id, v.clienteId))
    .leftJoin(veic, eq(veic.id, v.veiculoId))
    .leftJoin(vend, eq(vend.id, v.vendedorId))
    .where(and(f.status ? eq(v.status, f.status) : undefined, f.dias ? gte(v.criadoEm, sql`now() - make_interval(days => ${f.dias})`) : undefined))
    .orderBy(desc(v.criadoEm))
    .limit(300);
}

export async function obterVenda(id: number) {
  const v = schema.vendas;
  const [l] = await db
    .select({ venda: v, cliente: schema.clientes, veiculo: schema.veiculos, vendedor: schema.usuarios.nome })
    .from(v)
    .innerJoin(schema.clientes, eq(schema.clientes.id, v.clienteId))
    .leftJoin(schema.veiculos, eq(schema.veiculos.id, v.veiculoId))
    .leftJoin(schema.usuarios, eq(schema.usuarios.id, v.vendedorId))
    .where(eq(v.id, id))
    .limit(1);
  if (!l) return null;
  const [pagamentos, assinaturas, historico] = await Promise.all([
    db.select().from(schema.vendaPagamentos).where(eq(schema.vendaPagamentos.vendaId, id)).orderBy(schema.vendaPagamentos.id),
    db
      .select({
        id: schema.assinaturas.id,
        token: schema.assinaturas.token,
        modo: schema.assinaturas.modo,
        status: schema.assinaturas.status,
        documentoHash: schema.assinaturas.documentoHash,
        assinanteNome: schema.assinaturas.assinanteNome,
        assinadoEm: schema.assinaturas.assinadoEm,
        expiraEm: schema.assinaturas.expiraEm,
        criadoEm: schema.assinaturas.criadoEm,
      })
      .from(schema.assinaturas)
      .where(and(eq(schema.assinaturas.documentoTipo, "venda"), eq(schema.assinaturas.documentoId, id)))
      .orderBy(desc(schema.assinaturas.id)),
    db
      .select({ id: schema.logs.id, descricao: schema.logs.descricao, usuarioNome: schema.logs.usuarioNome, criadoEm: schema.logs.criadoEm })
      .from(schema.logs)
      .where(and(eq(schema.logs.entidade, "venda"), eq(schema.logs.entidadeId, String(id))))
      .orderBy(desc(schema.logs.criadoEm))
      .limit(50),
  ]);
  return { ...l, pagamentos, assinaturas, historico };
}
export type DetalheVenda = NonNullable<Awaited<ReturnType<typeof obterVenda>>>;
