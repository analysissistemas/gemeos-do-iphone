"use server";
import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { autorizar } from "@/lib/auth/dal";
import { executar, ErroRegra } from "@/lib/acao";
import {
  cancelarVenda,
  confirmarAssinaturaPresencial,
  criarLinkAssinatura,
  criarVendaDireta,
  finalizarVenda,
  gerarDocumentoVenda,
  salvarRascunho,
} from "@/lib/servicos/vendas";

const revalidar = (id?: number) => {
  revalidatePath("/sistema/vendas");
  if (id) revalidatePath(`/sistema/vendas/${id}`);
  revalidatePath("/sistema/funil");
  revalidatePath("/sistema/estoque");
  revalidatePath("/sistema");
};

export async function acaoNovaVenda(clienteId: number) {
  return executar(async () => {
    const u = await autorizar("vendas.editar");
    const id = await criarVendaDireta(u, clienteId);
    revalidar();
    return { id };
  });
}

export async function acaoSalvarVenda(id: number, dados: Record<string, unknown>) {
  return executar(async () => {
    const u = await autorizar("vendas.editar");
    const r = await salvarRascunho(u, id, dados);
    revalidar(id);
    return r;
  }, "Venda salva");
}

export async function acaoGerarDocumento(id: number) {
  return executar(async () => {
    const u = await autorizar("vendas.editar");
    const hash = await gerarDocumentoVenda(u, id);
    revalidar(id);
    return { hash };
  }, "Documento gerado");
}

export async function acaoLinkAssinatura(id: number) {
  return executar(async () => {
    const u = await autorizar("vendas.editar");
    const [v] = await db.select({ hash: schema.vendas.documentoHash, status: schema.vendas.status }).from(schema.vendas).where(eq(schema.vendas.id, id)).limit(1);
    if (!v?.hash) throw new ErroRegra("Gere o documento antes de pedir a assinatura.");
    if (v.status !== "aguardando_assinatura") throw new ErroRegra("Esta venda não está aguardando assinatura.");
    const token = await criarLinkAssinatura(u, "venda", id, v.hash);
    revalidar(id);
    return { token };
  }, "Link de assinatura criado");
}

export async function acaoAssinaturaPresencial(id: number, nome: string) {
  return executar(async () => {
    const u = await autorizar("vendas.editar");
    await confirmarAssinaturaPresencial(u, id, nome);
    revalidar(id);
    return null;
  }, "Assinatura presencial confirmada");
}

export async function acaoFinalizarVenda(id: number) {
  return executar(async () => {
    const u = await autorizar("vendas.editar");
    await finalizarVenda(u, id);
    revalidar(id);
    return null;
  }, "Venda finalizada");
}

export async function acaoCancelarVenda(id: number, motivo: string) {
  return executar(async () => {
    const u = await autorizar("vendas.cancelar");
    await cancelarVenda(u, id, motivo);
    revalidar(id);
    return null;
  }, "Venda cancelada");
}

/** Consulta leve para a tela acompanhar a assinatura sem recarregar. */
export async function acaoStatusAssinatura(id: number) {
  await autorizar("vendas.ver");
  const [v] = await db.select({ status: schema.vendas.status }).from(schema.vendas).where(eq(schema.vendas.id, id)).limit(1);
  const [a] = await db
    .select({ status: schema.assinaturas.status, assinadoEm: schema.assinaturas.assinadoEm })
    .from(schema.assinaturas)
    .where(and(eq(schema.assinaturas.documentoTipo, "venda"), eq(schema.assinaturas.documentoId, id)))
    .orderBy(desc(schema.assinaturas.id))
    .limit(1);
  return { venda: v?.status ?? null, assinatura: a ?? null };
}
