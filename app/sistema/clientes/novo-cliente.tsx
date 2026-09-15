"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Botao } from "@/components/ui/botao";
import { FormularioCliente } from "@/components/clientes/formulario-cliente";

export function BotaoNovoCliente({ equipe }: { equipe: { id: number; nome: string }[] }) {
  const [aberto, setAberto] = useState(false);
  const router = useRouter();
  return (
    <>
      <Botao variante="primario" onClick={() => setAberto(true)}>
        <UserPlus className="size-4" /> Novo cliente
      </Botao>
      <FormularioCliente aberto={aberto} aoMudar={setAberto} equipe={equipe} aoSalvar={(id) => router.push(`/sistema/clientes/${id}`)} />
    </>
  );
}
