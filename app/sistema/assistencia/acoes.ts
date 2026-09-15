"use server";
import { revalidatePath } from "next/cache";
import { autorizar } from "@/lib/auth/dal";
import { executar } from "@/lib/acao";
import { STATUS_OS, type StatusOs } from "@/lib/dominio";
import { veiculosDoCliente } from "@/lib/consultas/os";
import { abrirOs, adicionarItemOs, atualizarOs, gerarAssistenciaIa, mudarStatusOs, removerItemOs } from "@/lib/servicos/os";

const revalidar = (id?: number) => {
  revalidatePath("/sistema/assistencia");
  if (id) revalidatePath(`/sistema/assistencia/${id}`);
};

export async function acaoAbrirOs(dados: Record<string, unknown>) {
  return executar(async () => {
    const u = await autorizar("os.editar");
    const id = await abrirOs(u, dados);
    revalidar();
    return { id };
  }, "Ordem de serviço aberta");
}

export async function acaoStatusOs(id: number, status: string, observacao?: string) {
  return executar(async () => {
    const u = await autorizar("os.editar");
    if (status !== "cancelada" && !STATUS_OS.some((s) => s.id === status)) throw new Error("status inválido");
    await mudarStatusOs(u, id, status as StatusOs, observacao);
    revalidar(id);
    return null;
  }, "Situação atualizada");
}

export async function acaoAtualizarOs(id: number, dados: Record<string, unknown>) {
  return executar(async () => {
    const u = await autorizar("os.editar");
    await atualizarOs(u, id, dados);
    revalidar(id);
    return null;
  }, "Ordem de serviço salva");
}

export async function acaoAdicionarItem(osId: number, dados: Record<string, unknown>) {
  return executar(async () => {
    const u = await autorizar("os.editar");
    await adicionarItemOs(u, osId, dados);
    revalidar(osId);
    return null;
  }, "Item lançado");
}

export async function acaoRemoverItem(osId: number, itemId: number) {
  return executar(async () => {
    const u = await autorizar("os.editar");
    await removerItemOs(u, itemId);
    revalidar(osId);
    return null;
  }, "Item removido");
}

export async function acaoIaOs(osId: number) {
  return executar(async () => {
    const u = await autorizar("os.editar");
    const r = await gerarAssistenciaIa(u, osId);
    revalidar(osId);
    return r;
  }, "Apoio da IA gerado");
}

export async function acaoVeiculosDoCliente(clienteId: number) {
  await autorizar("os.ver");
  return veiculosDoCliente(clienteId);
}
