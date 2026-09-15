import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirPermissao } from "@/lib/auth/dal";
import { obterPerfilCliente } from "@/lib/consultas/clientes";
import { listarEquipe } from "@/lib/consultas/equipe";
import { pode } from "@/lib/dominio";
import { Pagina } from "@/components/ui/pagina";
import { PerfilClienteTela } from "./perfil";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Cliente nº ${id}` };
}

export default async function PaginaPerfilCliente({ params }: { params: Promise<{ id: string }> }) {
  const u = await exigirPermissao("clientes.ver");
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num) || num <= 0) notFound();
  const [perfil, equipe] = await Promise.all([obterPerfilCliente(num), listarEquipe()]);
  if (!perfil) notFound();
  return (
    <Pagina>
      <PerfilClienteTela
        perfil={perfil}
        equipe={equipe}
        permissoes={{
          editar: pode(u.papel, "clientes.editar"),
          funil: pode(u.papel, "funil.editar"),
          vendas: pode(u.papel, "vendas.ver"),
          os: pode(u.papel, "os.editar"),
          conversas: pode(u.papel, "conversas.ver"),
        }}
      />
    </Pagina>
  );
}
