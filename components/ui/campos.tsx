"use client";
import { cloneElement, forwardRef, isValidElement, useId, useState } from "react";
import { cn } from "@/lib/cn";

const baseCampo =
  "w-full rounded-xl border bg-plano/60 px-3 text-[14px] text-ink placeholder:text-ink-3 transition outline-none focus:border-ink-2 focus:ring-2 focus:ring-trilho disabled:opacity-60";

export function Campo({
  rotulo,
  erro,
  dica,
  obrigatorio,
  children,
  className,
  htmlFor,
}: {
  rotulo: string;
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  /* rótulo ligado ao campo mesmo quando quem usa não passa id: leitor de tela
     anuncia o nome do campo e clicar no rótulo foca a entrada */
  const automatico = useId();
  const filho = isValidElement<{ id?: string }>(children) ? children : null;
  const alvo = htmlFor ?? filho?.props.id ?? (filho ? automatico : undefined);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={alvo} className="text-[12px] font-medium text-ink-2">
        {rotulo}
        {obrigatorio && <span className="text-critico"> *</span>}
      </label>
      {filho && !htmlFor && !filho.props.id ? cloneElement(filho, { id: automatico }) : children}
      {erro ? (
        <p className="text-[12px] text-critico" role="alert">
          {erro}
        </p>
      ) : dica ? (
        <p className="text-[12px] text-ink-3">{dica}</p>
      ) : null}
    </div>
  );
}

type EntradaProps = React.InputHTMLAttributes<HTMLInputElement> & { invalido?: boolean };
export const Entrada = forwardRef<HTMLInputElement, EntradaProps>(function Entrada({ className, invalido, ...r }, ref) {
  return (
    <input
      ref={ref}
      className={cn(baseCampo, "h-10", invalido ? "border-critico" : "border-linha", className)}
      aria-invalid={invalido || undefined}
      {...r}
    />
  );
});

type SelecaoProps = React.SelectHTMLAttributes<HTMLSelectElement> & { invalido?: boolean };
export function Selecao({ className, invalido, children, ...r }: SelecaoProps) {
  return (
    <select
      className={cn(baseCampo, "h-10 appearance-none bg-[length:14px] bg-[right_12px_center] bg-no-repeat pr-9", invalido ? "border-critico" : "border-linha", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%238a8a90' stroke-width='2'%3E%3Cpath d='m5 8 5 5 5-5'/%3E%3C/svg%3E\")",
      }}
      aria-invalid={invalido || undefined}
      {...r}
    >
      {children}
    </select>
  );
}

type AreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalido?: boolean };
export const AreaTexto = forwardRef<HTMLTextAreaElement, AreaProps>(function AreaTexto({ className, invalido, ...r }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(baseCampo, "min-h-[88px] py-2.5 leading-relaxed", invalido ? "border-critico" : "border-linha", className)}
      aria-invalid={invalido || undefined}
      {...r}
    />
  );
});

/** Campo de dinheiro: mostra "R$ 12.500,00" e entrega número. */
export function CampoDinheiro({
  valor,
  aoMudar,
  invalido,
  id,
  placeholder = "R$ 0,00",
  disabled,
  name,
  "aria-label": rotuloAcessivel,
}: {
  "aria-label"?: string;
  valor: number | null | undefined;
  aoMudar: (v: number | null) => void;
  invalido?: boolean;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
}) {
  const [foco, setFoco] = useState(false);
  const texto =
    valor == null ? "" : valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
  return (
    <Entrada
      id={id}
      name={name}
      aria-label={rotuloAcessivel}
      inputMode="numeric"
      placeholder={placeholder}
      invalido={invalido}
      disabled={disabled}
      value={texto}
      className={cn("num", foco && "border-ink-2")}
      onFocus={() => setFoco(true)}
      onBlur={() => setFoco(false)}
      onChange={(e) => {
        const d = e.target.value.replace(/\D/g, "");
        aoMudar(d ? Number(d) / 100 : null);
      }}
    />
  );
}

export function useIdCampo(prefixo: string) {
  const id = useId();
  return `${prefixo}-${id}`;
}

export function Alternar({
  marcado,
  aoMudar,
  rotulo,
  descricao,
}: {
  marcado: boolean;
  aoMudar: (v: boolean) => void;
  rotulo: string;
  descricao?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-linha px-3 py-2.5 hover:border-linha-forte">
      <input type="checkbox" className="mt-0.5 size-4 accent-[var(--ink)]" checked={marcado} onChange={(e) => aoMudar(e.target.checked)} />
      <span className="flex flex-col">
        <span className="text-[14px] text-ink">{rotulo}</span>
        {descricao && <span className="text-[12px] text-ink-3">{descricao}</span>}
      </span>
    </label>
  );
}
