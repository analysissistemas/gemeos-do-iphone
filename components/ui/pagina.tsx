import { cn } from "@/lib/cn";

/** Área de conteúdo padrão das telas do sistema. */
export function Pagina({ children, className, larga, estreita }: { children: React.ReactNode; className?: string; larga?: boolean; estreita?: boolean }) {
  return <div className={cn("mx-auto w-full px-4 py-5 sm:px-6 sm:py-7", larga ? "max-w-[1600px]" : estreita ? "max-w-2xl" : "max-w-[1280px]", className)}>{children}</div>;
}
