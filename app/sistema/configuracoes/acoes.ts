"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { autorizar } from "@/lib/auth/dal";
import { executar, ErroRegra } from "@/lib/acao";
import { registrarLog } from "@/lib/logs";
import { carregarDemonstracao, limparDemonstracao } from "@/lib/mensageria/demo";

const texto = (max: number) => z.string().trim().max(max).nullable().optional().transform((v) => v || null);

const esquemaEmpresa = z.object({
  nomeFantasia: z.string().trim().min(2, "Informe o nome").max(120),
  razaoSocial: texto(160),
  cnpj: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v ? v.replace(/\D/g, "") : null))
    .refine((v) => !v || v.length === 14, "CNPJ com 14 números"),
  telefone: texto(20),
  whatsapp: texto(20),
  email: texto(120),
  instagram: texto(60),
  endereco: texto(200),
  cidade: texto(80),
  estado: texto(2),
  cep: texto(9),
  condicoesVenda: texto(4000),
  condicoesOs: texto(4000),
});

export async function acaoSalvarEmpresa(dados: Record<string, unknown>) {
  return executar(async () => {
    const u = await autorizar("config.gerenciar");
    const d = esquemaEmpresa.parse(dados);
    await db
      .insert(schema.empresa)
      .values({ id: 1, ...d, atualizadoPor: u.id })
      .onConflictDoUpdate({ target: schema.empresa.id, set: { ...d, atualizadoEm: new Date(), atualizadoPor: u.id } });
    await registrarLog(u, { acao: "configuracao.empresa", entidade: "configuracao", descricao: "Atualizou os dados da empresa usados nos documentos" });
    revalidatePath("/sistema/configuracoes");
    return null;
  }, "Dados da empresa salvos");
}

const esquemaResposta = z.object({
  atalho: z
    .string()
    .trim()
    .toLowerCase()
    .transform((v) => v.replace(/^\//, ""))
    .pipe(z.string().regex(/^[a-z0-9_-]{2,30}$/, "Use de 2 a 30 letras minúsculas, números, _ ou -")),
  titulo: z.string().trim().min(2, "Informe o título").max(60),
  conteudo: z.string().trim().min(2, "Escreva a resposta").max(1000),
  ativo: z.boolean().default(true),
});

export async function acaoSalvarResposta(id: number | null, dados: Record<string, unknown>) {
  return executar(async () => {
    const u = await autorizar("config.gerenciar");
    const d = esquemaResposta.parse(dados);
    if (id) await db.update(schema.respostasRapidas).set({ ...d, atualizadoEm: new Date() }).where(eq(schema.respostasRapidas.id, id));
    else await db.insert(schema.respostasRapidas).values(d);
    await registrarLog(u, { acao: "configuracao.resposta_rapida", entidade: "configuracao", descricao: `${id ? "Editou" : "Criou"} a resposta rápida /${d.atalho}` });
    revalidatePath("/sistema/configuracoes");
    return null;
  }, "Resposta rápida salva");
}

export async function acaoExcluirResposta(id: number) {
  return executar(async () => {
    const u = await autorizar("config.gerenciar");
    const [r] = await db.delete(schema.respostasRapidas).where(eq(schema.respostasRapidas.id, id)).returning({ atalho: schema.respostasRapidas.atalho });
    if (!r) throw new ErroRegra("Resposta não encontrada.");
    await registrarLog(u, { acao: "configuracao.resposta_rapida", entidade: "configuracao", descricao: `Excluiu a resposta rápida /${r.atalho}` });
    revalidatePath("/sistema/configuracoes");
    return null;
  }, "Resposta rápida excluída");
}

export async function acaoTriagemAutomatica(ligada: boolean) {
  return executar(async () => {
    const u = await autorizar("config.gerenciar");
    await db
      .insert(schema.configuracoes)
      .values({ chave: "ia.triagem_automatica", valor: ligada, atualizadoPor: u.id })
      .onConflictDoUpdate({ target: schema.configuracoes.chave, set: { valor: ligada, atualizadoEm: new Date(), atualizadoPor: u.id } });
    await registrarLog(u, { acao: "configuracao.ia", entidade: "configuracao", descricao: `${ligada ? "Ligou" : "Desligou"} a triagem automática da IA no atendimento` });
    revalidatePath("/sistema/configuracoes");
    return null;
  }, ligada ? "Triagem automática ligada" : "Triagem automática desligada");
}

export async function acaoCarregarDemo() {
  return executar(async () => {
    const u = await autorizar("config.gerenciar");
    const r = await carregarDemonstracao(u);
    revalidatePath("/sistema/conversas");
    revalidatePath("/sistema/funil");
    return r;
  });
}

export async function acaoLimparDemo() {
  return executar(async () => {
    const u = await autorizar("config.gerenciar");
    const r = await limparDemonstracao(u);
    revalidatePath("/sistema/conversas");
    revalidatePath("/sistema/funil");
    revalidatePath("/sistema/clientes");
    return r;
  });
}
