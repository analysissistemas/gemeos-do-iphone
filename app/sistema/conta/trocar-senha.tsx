"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Painel, TituloSecao } from "@/components/ui/basicos";
import { Botao } from "@/components/ui/botao";
import { Campo, Entrada } from "@/components/ui/campos";
import { acaoTrocarSenha } from "./acoes";

export function TrocarSenha() {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState<string>();
  const [pendente, iniciar] = useTransition();
  return (
    <Painel className="p-5">
      <TituloSecao>Trocar senha</TituloSecao>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (nova !== confirma) return setErro("A confirmação não confere com a nova senha.");
          iniciar(async () => {
            const r = await acaoTrocarSenha(atual, nova);
            if (!r.ok) return setErro(r.campos ? Object.values(r.campos)[0] : r.erro);
            setErro(undefined);
            setAtual("");
            setNova("");
            setConfirma("");
            toast.success(r.mensagem);
          });
        }}
      >
        <Campo rotulo="Senha atual">
          <Entrada type="password" autoComplete="current-password" value={atual} onChange={(e) => setAtual(e.target.value)} />
        </Campo>
        <Campo rotulo="Nova senha" dica="Mínimo de 10 caracteres, com letras e números.">
          <Entrada type="password" autoComplete="new-password" value={nova} onChange={(e) => setNova(e.target.value)} />
        </Campo>
        <Campo rotulo="Confirme a nova senha" erro={erro}>
          <Entrada type="password" autoComplete="new-password" value={confirma} onChange={(e) => setConfirma(e.target.value)} />
        </Campo>
        <div>
          <Botao type="submit" variante="primario" carregando={pendente}>
            Salvar nova senha
          </Botao>
        </div>
      </form>
    </Painel>
  );
}
