import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirPermissao } from "@/lib/auth/dal";
import { obterOs } from "@/lib/consultas/os";
import { listarEquipe } from "@/lib/consultas/equipe";
import { pode } from "@/lib/dominio";
import { numeroDoc } from "@/lib/formato";
import { transicoesOs } from "@/lib/servicos/os";
import { Pagina } from "@/components/ui/pagina";
import { DetalheOsTela } from "./detalhe";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return { title: numeroDoc("OS", Number((await params).id)) };
}

export default async function PaginaOs({ params }: { params: Promise<{ id: string }> }) {
  const u = await exigirPermissao("os.ver");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const [os, equipe] = await Promise.all([obterOs(id), listarEquipe()]);
  if (!os) notFound();
  return (
    <Pagina>
      <DetalheOsTela d={os} equipe={equipe} proximos={transicoesOs(os.os.status)} podeEditar={pode(u.papel, "os.editar")} />
    </Pagina>
  );
}
