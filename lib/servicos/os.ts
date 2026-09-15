import "server-only";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { ErroRegra } from "@/lib/acao";
import { registrarLog } from "@/lib/logs";
import { CANAIS_RECEBIMENTO, RESULTADOS_OS, rotuloStatusOs, type StatusOs } from "@/lib/dominio";
import { brl, numeroDoc } from "@/lib/formato";
import { esquemaOs } from "@/lib/validacao";
import { assistirOs } from "@/lib/ia/diagnosticos";
import { IaIndisponivel } from "@/lib/ia/cliente";

type Quem = { id: number; nome: string };

/* ============================================================
   ORDEM DE SERVIÇO
   aberta → aguardando → análise → execução ⇄ aguardando peça →
   finalizada → entregue. Cada passo grava QUEM fez e QUANDO.
   ============================================================ */
const PROXIMOS: Record<string, StatusOs[]> = {
  aberta: ["aguardando", "analise", "cancelada"],
  aguardando: ["analise", "cancelada"],
  analise: ["execucao", "aguardando_peca", "finalizada", "cancelada"],
  execucao: ["aguardando_peca", "finalizada", "analise", "cancelada"],
  aguardando_peca: ["execucao", "analise", "cancelada"],
  finalizada: ["entregue", "execucao"],
  entregue: [],
  cancelada: [],
};
export const transicoesOs = (s: string) => PROXIMOS[s] ?? [];

const doc = (id: number) => numeroDoc("OS", id);

export async function abrirOs(u: Quem, entrada: unknown) {
  const d = esquemaOs.parse(entrada);
  return db.transaction(async (tx) => {
    const [cli] = await tx.select({ nome: schema.clientes.nome }).from(schema.clientes).where(eq(schema.clientes.id, d.clienteId)).limit(1);
    if (!cli) throw new ErroRegra("Cliente não encontrado.");
    const [un] = d.unidadeId ? await tx.select({ nome: schema.unidades.nome }).from(schema.unidades).where(eq(schema.unidades.id, d.unidadeId)).limit(1) : [];
    const [os] = await tx.insert(schema.ordensServico).values({ ...d, abertaPor: u.id }).returning({ id: schema.ordensServico.id });
    const onde = [CANAIS_RECEBIMENTO[d.canalRecebimento], un?.nome ? `loja ${un.nome}` : null].filter(Boolean).join(" · ");
    await tx.insert(schema.osEventos).values({ osId: os.id, tipo: "aberta", descricao: `OS aberta (${onde})`, paraStatus: "aberta", usuarioId: u.id });
    await registrarLog(u, { acao: "os.criada", entidade: "os", entidadeId: os.id, descricao: `Abriu a ${doc(os.id)} de ${cli.nome}: ${d.veiculoDescricao}` }, tx);
    return os.id;
  });
}

export async function mudarStatusOs(u: Quem, id: number, destino: StatusOs, observacao?: string) {
  return db.transaction(async (tx) => {
    const [os] = await tx.select().from(schema.ordensServico).where(eq(schema.ordensServico.id, id)).limit(1);
    if (!os) throw new ErroRegra("OS não encontrada.");
    if (!transicoesOs(os.status).includes(destino)) throw new ErroRegra(`Não dá para ir de "${rotuloStatusOs(os.status)}" para "${rotuloStatusOs(destino)}".`);
    if (destino === "finalizada" && (!os.diagnosticoTecnico || !os.solucaoAplicada || !os.resultado)) {
      throw new ErroRegra("Para finalizar, registre o diagnóstico técnico, a solução aplicada e o resultado.");
    }
    if (destino === "cancelada" && (!observacao || observacao.trim().length < 5)) throw new ErroRegra("Informe o motivo do cancelamento.");
    const agora = new Date();
    const extra: Partial<typeof schema.ordensServico.$inferInsert> = {};
    if (!os.recebidaPor && destino !== "cancelada") Object.assign(extra, { recebidaPor: u.id, recebidaEm: agora });
    if ((destino === "analise" || destino === "execucao") && !os.tecnicoId) extra.tecnicoId = u.id;
    if (destino === "finalizada") Object.assign(extra, { finalizadaPor: u.id, finalizadaEm: agora });
    if (destino === "entregue") Object.assign(extra, { entreguePor: u.id, entregueEm: agora });
    if (destino === "execucao" && os.status === "finalizada") Object.assign(extra, { finalizadaPor: null, finalizadaEm: null });
    await tx.update(schema.ordensServico).set({ status: destino, ...extra, atualizadoEm: agora }).where(eq(schema.ordensServico.id, id));
    const texto =
      destino === "aguardando" && os.status === "aberta"
        ? "OS recebida — aguardando atendimento"
        : `${rotuloStatusOs(os.status)} → ${rotuloStatusOs(destino)}${observacao ? `: ${observacao.trim()}` : ""}`;
    await tx.insert(schema.osEventos).values({ osId: id, tipo: "status", descricao: texto, deStatus: os.status, paraStatus: destino, usuarioId: u.id });
    const acao = destino === "finalizada" ? "os.finalizada" : destino === "entregue" ? "os.entregue" : destino === "cancelada" ? "os.cancelada" : "os.atualizada";
    await registrarLog(u, { acao, entidade: "os", entidadeId: id, descricao: `${doc(id)}: ${texto}` }, tx);
  });
}

export const esquemaDiagnosticoOs = z.object({
  diagnosticoTecnico: z.string().max(4000).nullable().optional().transform((v) => v?.trim() || null),
  solucaoAplicada: z.string().max(4000).nullable().optional().transform((v) => v?.trim() || null),
  servicosRealizados: z.string().max(4000).nullable().optional().transform((v) => v?.trim() || null),
  observacoes: z.string().max(4000).nullable().optional().transform((v) => v?.trim() || null),
  resultado: z
    .union([z.enum(Object.keys(RESULTADOS_OS) as [string, ...string[]]), z.literal(""), z.null()])
    .transform((v) => v || null),
  previsaoEntrega: z.string().nullable().optional().transform((v) => v || null),
  tecnicoId: z.union([z.null(), z.literal(""), z.coerce.number().int().positive()]).optional().transform((v) => (typeof v === "number" ? v : null)),
  km: z.union([z.null(), z.literal(""), z.coerce.number().int().min(0)]).optional().transform((v) => (typeof v === "number" ? v : null)),
});

export async function atualizarOs(u: Quem, id: number, entrada: unknown) {
  const d = esquemaDiagnosticoOs.parse(entrada);
  return db.transaction(async (tx) => {
    const [os] = await tx.select().from(schema.ordensServico).where(eq(schema.ordensServico.id, id)).limit(1);
    if (!os) throw new ErroRegra("OS não encontrada.");
    if (os.status === "entregue" || os.status === "cancelada") throw new ErroRegra("OS encerrada não pode ser alterada.");
    const campos = (Object.keys(d) as (keyof typeof d)[]).filter((k) => (os[k] ?? null) !== (d[k] ?? null));
    if (!campos.length) return;
    await tx.update(schema.ordensServico).set({ ...d, atualizadoEm: new Date() }).where(eq(schema.ordensServico.id, id));
    const nomes: Record<string, string> = {
      diagnosticoTecnico: "diagnóstico técnico", solucaoAplicada: "solução aplicada", servicosRealizados: "serviços realizados", observacoes: "observações",
      resultado: "resultado", previsaoEntrega: "previsão de entrega", tecnicoId: "técnico responsável", km: "quilometragem",
    };
    const texto = `Atualizou ${campos.map((k) => nomes[k]).join(", ")}`;
    await tx.insert(schema.osEventos).values({ osId: id, tipo: "atualizada", descricao: texto, usuarioId: u.id, dados: { campos } });
    await registrarLog(u, { acao: "os.atualizada", entidade: "os", entidadeId: id, descricao: `${doc(id)}: ${texto}` }, tx);
  });
}

export const esquemaItemOs = z.object({
  tipo: z.enum(["peca", "servico"]),
  descricao: z.string().trim().min(2, "Descreva a peça ou serviço").max(200),
  quantidade: z.coerce.number().positive("Quantidade inválida").max(9999),
  valorUnitario: z.coerce.number().min(0).max(9_999_999),
});

export async function adicionarItemOs(u: Quem, osId: number, entrada: unknown) {
  const d = esquemaItemOs.parse(entrada);
  return db.transaction(async (tx) => {
    const [os] = await tx.select({ status: schema.ordensServico.status }).from(schema.ordensServico).where(eq(schema.ordensServico.id, osId)).limit(1);
    if (!os) throw new ErroRegra("OS não encontrada.");
    if (os.status === "entregue" || os.status === "cancelada") throw new ErroRegra("OS encerrada.");
    await tx.insert(schema.osItens).values({ ...d, osId });
    const texto = `${d.tipo === "peca" ? "Peça" : "Serviço"} lançado: ${d.quantidade}x ${d.descricao}${d.valorUnitario ? ` (${brl(d.valorUnitario * d.quantidade, 2)})` : ""}`;
    await tx.insert(schema.osEventos).values({ osId, tipo: "item", descricao: texto, usuarioId: u.id });
    await registrarLog(u, { acao: "os.atualizada", entidade: "os", entidadeId: osId, descricao: `${doc(osId)}: ${texto}` }, tx);
  });
}

export async function removerItemOs(u: Quem, itemId: number) {
  return db.transaction(async (tx) => {
    const [item] = await tx.select().from(schema.osItens).where(eq(schema.osItens.id, itemId)).limit(1);
    if (!item) throw new ErroRegra("Item não encontrado.");
    const [os] = await tx.select({ status: schema.ordensServico.status }).from(schema.ordensServico).where(eq(schema.ordensServico.id, item.osId)).limit(1);
    if (os.status === "entregue" || os.status === "cancelada") throw new ErroRegra("OS encerrada.");
    await tx.delete(schema.osItens).where(eq(schema.osItens.id, itemId));
    const texto = `Item removido: ${item.quantidade}x ${item.descricao}`;
    await tx.insert(schema.osEventos).values({ osId: item.osId, tipo: "item", descricao: texto, usuarioId: u.id });
    await registrarLog(u, { acao: "os.atualizada", entidade: "os", entidadeId: item.osId, descricao: `${doc(item.osId)}: ${texto}` }, tx);
  });
}

export async function gerarAssistenciaIa(u: Quem, osId: number) {
  let r;
  try {
    r = await assistirOs(osId);
  } catch (e) {
    if (e instanceof IaIndisponivel) throw new ErroRegra(e.message);
    throw e;
  }
  await db.transaction(async (tx) => {
    await tx.update(schema.ordensServico).set({ iaAssistencia: r, iaEm: new Date() }).where(eq(schema.ordensServico.id, osId));
    await tx.insert(schema.osEventos).values({ osId, tipo: "ia", descricao: "Apoio da IA gerado (hipóteses para o técnico conferir)", usuarioId: u.id });
    await registrarLog(u, { acao: "os.ia", entidade: "os", entidadeId: osId, descricao: `${doc(osId)}: gerou apoio da IA` }, tx);
  });
  return r;
}
