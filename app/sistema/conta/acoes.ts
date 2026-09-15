"use server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { ErroAcesso, obterUsuario } from "@/lib/auth/dal";
import { conferirSenha, gerarHash } from "@/lib/auth/senha";
import { criarSessao } from "@/lib/auth/sessao";
import { executar, ErroRegra } from "@/lib/acao";
import { registrarLog } from "@/lib/logs";
import { senhaForte } from "@/lib/validacao";

export async function acaoTrocarSenha(atual: string, nova: string) {
  return executar(async () => {
    const eu = await obterUsuario();
    if (!eu) throw new ErroAcesso("Sua sessão expirou. Entre de novo.");
    const [u] = await db.select().from(schema.usuarios).where(eq(schema.usuarios.id, eu.id)).limit(1);
    if (!(await conferirSenha(atual, u.senhaHash))) throw new ErroRegra("A senha atual não confere.");
    const senha = senhaForte.parse(nova);
    if (atual === senha) throw new ErroRegra("A nova senha precisa ser diferente da atual.");
    const versao = u.sessaoVersao + 1;
    await db.update(schema.usuarios).set({ senhaHash: await gerarHash(senha), sessaoVersao: versao, atualizadoEm: new Date() }).where(eq(schema.usuarios.id, u.id));
    /* outras sessões caem; esta continua com um cookie novo */
    await criarSessao({ uid: u.id, v: versao });
    await registrarLog(eu, { acao: "usuario.senha_trocada", entidade: "usuario", entidadeId: u.id, descricao: "Trocou a própria senha" });
    return null;
  }, "Senha trocada. Outras sessões abertas foram encerradas.");
}
