"use client";
import { useEffect, useRef, useState } from "react";
import { Search, UserPlus, X } from "lucide-react";
import { formatarTelefone } from "@/lib/formato";
import { buscarClientes } from "@/app/sistema/clientes/acoes";
import { FormularioCliente } from "./formulario-cliente";

type Achado = { id: number; nome: string; whatsapp: string | null; telefone: string | null; cpf: string | null };

/** Busca de cliente por nome, telefone ou CPF, com cadastro rápido. */
export function SeletorCliente({
  valor,
  aoMudar,
  equipe,
  invalido,
  desabilitado,
}: {
  valor: { id: number; nome: string } | null;
  aoMudar: (c: { id: number; nome: string } | null) => void;
  equipe: { id: number; nome: string }[];
  invalido?: boolean;
  desabilitado?: boolean;
}) {
  const [termo, setTermo] = useState("");
  const [lista, setLista] = useState<Achado[]>([]);
  const [aberto, setAberto] = useState(false);
  const [novo, setNovo] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (termo.trim().length < 2) return;
    timer.current = setTimeout(async () => setLista(await buscarClientes(termo)), 250);
  }, [termo]);
  const visiveis = termo.trim().length >= 2 ? lista : [];

  if (valor)
    return (
      <div className="flex h-10 items-center justify-between gap-2 rounded-xl border border-linha bg-plano/60 px-3">
        <span className="truncate text-[14px] font-medium">{valor.nome}</span>
        {!desabilitado && (
          <button type="button" onClick={() => aoMudar(null)} className="text-ink-3 hover:text-ink" aria-label="Trocar cliente">
            <X className="size-4" />
          </button>
        )}
      </div>
    );

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
      <input
        value={termo}
        onChange={(e) => {
          setTermo(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 150)}
        placeholder="Buscar por nome, telefone ou CPF"
        aria-invalid={invalido || undefined}
        className={`h-10 w-full rounded-xl border bg-plano/60 pl-9 pr-3 text-[14px] outline-none placeholder:text-ink-3 focus:border-ink-2 ${invalido ? "border-critico" : "border-linha"}`}
      />
      {aberto && termo.trim().length >= 2 && (
        <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-2xl border border-linha-forte bg-elevado p-1 shadow-alta">
          {visiveis.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  aoMudar({ id: c.id, nome: c.nome });
                  setTermo("");
                }}
                className="flex w-full flex-col rounded-xl px-3 py-2 text-left hover:bg-trilho"
              >
                <span className="text-[14px] font-medium">{c.nome}</span>
                <span className="num text-[12px] text-ink-3">{formatarTelefone(c.whatsapp ?? c.telefone)}</span>
              </button>
            </li>
          ))}
          {visiveis.length === 0 && <li className="px-3 py-2 text-[13px] text-ink-3">Nenhum cliente encontrado.</li>}
          <li>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setNovo(true)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13.5px] font-semibold hover:bg-trilho"
            >
              <UserPlus className="size-4" /> Cadastrar novo cliente
            </button>
          </li>
        </ul>
      )}
      <FormularioCliente
        aberto={novo}
        aoMudar={setNovo}
        equipe={equipe}
        inicial={/^\d[\d\s()-]+$/.test(termo) ? { whatsapp: termo } : { nome: termo }}
        aoSalvar={(id, nome) => {
          aoMudar({ id, nome });
          setTermo("");
        }}
      />
    </div>
  );
}
