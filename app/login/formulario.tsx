"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Botao } from "@/components/ui/botao";
import { Campo, Entrada } from "@/components/ui/campos";
import { entrar, type EstadoLogin } from "./acoes";

export function FormularioLogin({ de }: { de?: string }) {
  const [estado, acao, pendente] = useActionState<EstadoLogin, FormData>(entrar, null);
  const router = useRouter();

  useEffect(() => {
    if (!estado?.destino) return;
    /* a vitrine lê esta marca para trocar "Sistema" por "Voltar ao sistema" */
    try {
      sessionStorage.setItem("gemeos-usuario", estado.nome ?? "");
    } catch {}
    router.replace(estado.destino);
  }, [estado, router]);

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="de" value={de ?? ""} />
      <Campo rotulo="Usuário" htmlFor="usuario">
        <Entrada id="usuario" name="usuario" autoComplete="username" autoCapitalize="none" required autoFocus />
      </Campo>
      <Campo rotulo="Senha" htmlFor="senha">
        <Entrada id="senha" name="senha" type="password" autoComplete="current-password" required />
      </Campo>
      {estado?.erro && (
        <p role="alert" className="rounded-xl border border-critico/40 bg-critico/10 px-3 py-2 text-[13px]">
          {estado.erro}
        </p>
      )}
      <Botao type="submit" variante="primario" tamanho="lg" carregando={pendente || !!estado?.destino} className="mt-1 w-full">
        Entrar
      </Botao>
    </form>
  );
}
