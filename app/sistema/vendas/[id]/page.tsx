import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirPermissao } from "@/lib/auth/dal";
import { obterVenda } from "@/lib/consultas/vendas";
import { listarVeiculosVendaveis } from "@/lib/consultas/estoque";
import { listarEquipe } from "@/lib/consultas/equipe";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { pode } from "@/lib/dominio";
import { numeroDoc } from "@/lib/formato";
import { Pagina } from "@/components/ui/pagina";
import { FluxoVenda } from "./fluxo";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return { title: `Venda ${numeroDoc("V", Number((await params).id))}` };
}

export default async function PaginaVenda({ params }: { params: Promise<{ id: string }> }) {
  const u = await exigirPermissao("vendas.ver");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const [venda, veiculos, equipe, empresa] = await Promise.all([
    obterVenda(id),
    listarVeiculosVendaveis(),
    listarEquipe(),
    db.select({ condicoesVenda: schema.empresa.condicoesVenda }).from(schema.empresa).where(eq(schema.empresa.id, 1)).limit(1),
  ]);
  if (!venda) notFound();
  /* custo do veículo nunca sai do servidor para quem não é administrador */
  const veiculo = venda.veiculo ? { ...venda.veiculo, custo: pode(u.papel, "custo.ver") ? venda.veiculo.custo : null } : null;
  const opcoes = veiculo && !veiculos.some((v) => v.id === veiculo.id)
    ? [{ id: veiculo.id, rotulo: [veiculo.marca, veiculo.modelo, veiculo.cor].filter(Boolean).join(" "), valorAnunciado: veiculo.valorAnunciado, status: veiculo.status, condicao: veiculo.condicao }, ...veiculos]
    : veiculos;
  return (
    <Pagina>
      <FluxoVenda
        venda={{ ...venda, veiculo }}
        veiculos={opcoes}
        equipe={equipe}
        condicoesPadrao={empresa[0]?.condicoesVenda ?? null}
        permissoes={{ editar: pode(u.papel, "vendas.editar"), cancelar: pode(u.papel, "vendas.cancelar"), custo: pode(u.papel, "custo.ver") }}
      />
    </Pagina>
  );
}
