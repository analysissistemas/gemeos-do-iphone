"use client";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/* Um componente para os três jeitos de sobrepor: janela no meio (modal),
   gaveta lateral (drawer) e, no celular, os dois viram tela cheia vinda de
   baixo — nada de janela espremida em 360px. */
export function Dialogo({
  aberto,
  aoMudar,
  titulo,
  descricao,
  children,
  rodape,
  tipo = "modal",
  largura = "md",
}: {
  aberto: boolean;
  aoMudar: (v: boolean) => void;
  titulo: React.ReactNode;
  descricao?: React.ReactNode;
  children: React.ReactNode;
  rodape?: React.ReactNode;
  tipo?: "modal" | "gaveta";
  largura?: "sm" | "md" | "lg" | "xl";
}) {
  const larguras = { sm: "sm:max-w-md", md: "sm:max-w-xl", lg: "sm:max-w-3xl", xl: "sm:max-w-5xl" };
  return (
    <D.Root open={aberto} onOpenChange={aoMudar}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-in" />
        <D.Content
          className={cn(
            "fixed z-50 flex flex-col bg-elevado text-ink shadow-alta outline-none",
            "inset-x-0 bottom-0 max-h-[94dvh] rounded-t-3xl border-t border-linha-forte",
            tipo === "modal" &&
              cn("sm:inset-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[calc(100%-32px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border sm:max-h-[88dvh]", larguras[largura]),
            tipo === "gaveta" &&
              cn("sm:inset-y-0 sm:left-auto sm:right-0 sm:bottom-auto sm:h-dvh sm:max-h-none sm:w-full sm:rounded-none sm:rounded-l-3xl sm:border-l sm:border-t-0", larguras[largura]),
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-linha px-5 pb-4 pt-5 sm:px-6">
            <div className="min-w-0">
              <D.Title className="text-[17px] font-semibold leading-tight tracking-tight">{titulo}</D.Title>
              {descricao ? (
                <D.Description className="mt-1 text-[13px] text-ink-2">{descricao}</D.Description>
              ) : (
                <D.Description className="sr-only">Detalhes</D.Description>
              )}
            </div>
            <D.Close className="-mr-2 grid size-9 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-trilho hover:text-ink" aria-label="Fechar">
              <X className="size-5" />
            </D.Close>
          </div>
          <div className="rolagem-fina flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
          {rodape && (
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-linha px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
              {rodape}
            </div>
          )}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

/** Rodapé para usar DENTRO do corpo: o corpo monta a cada abertura (o estado
 *  nasce limpo sem efeito) e os botões continuam fixos no fim da janela. */
export function RodapeDialogo({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky -bottom-5 z-10 -mx-5 -mb-5 mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-linha bg-elevado px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:-mx-6 sm:px-6">
      {children}
    </div>
  );
}
