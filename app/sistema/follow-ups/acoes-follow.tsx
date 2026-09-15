"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import { Botao, classesBotao } from "@/components/ui/botao";
import { pedirAtualizacaoContadores } from "@/components/shell/contadores";
import { acaoEncerrarFollowUp } from "@/app/sistema/conversas/acoes";

export function AcoesFollowUp({ id, conversaId }: { id: number; conversaId: number | null }) {
  const [pendente, iniciar] = useTransition();
  const router = useRouter();
  const encerrar = (como: "concluido" | "cancelado") =>
    iniciar(async () => {
      const r = await acaoEncerrarFollowUp(id, como);
      if (!r.ok) return void toast.error(r.erro);
      toast.success(r.mensagem);
      pedirAtualizacaoContadores();
      router.refresh();
    });
  return (
    <span className="flex shrink-0 flex-wrap gap-2">
      {conversaId && (
        <Link href={`/sistema/conversas?c=${conversaId}`} className={classesBotao("secundario", "sm")}>
          <MessageSquare className="size-4" /> Conversa
        </Link>
      )}
      <Botao tamanho="sm" variante="primario" carregando={pendente} onClick={() => encerrar("concluido")}>
        Concluir
      </Botao>
      <Botao tamanho="sm" variante="fantasma" disabled={pendente} onClick={() => encerrar("cancelado")}>
        Cancelar
      </Botao>
    </span>
  );
}
