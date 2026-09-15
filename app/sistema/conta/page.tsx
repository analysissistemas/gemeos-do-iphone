import type { Metadata } from "next";
import { exigirUsuario } from "@/lib/auth/dal";
import { PAPEIS } from "@/lib/dominio";
import { Pagina } from "@/components/ui/pagina";
import { CabecalhoPagina, ItemInfo, Painel } from "@/components/ui/basicos";
import { TrocarSenha } from "./trocar-senha";

export const metadata: Metadata = { title: "Minha conta" };

export default async function PaginaConta() {
  const u = await exigirUsuario();
  return (
    <Pagina estreita>
      <CabecalhoPagina titulo="Minha conta" />
      <Painel className="mb-4 p-5">
        <dl className="grid grid-cols-2 gap-4">
          <ItemInfo rotulo="Nome">{u.nome}</ItemInfo>
          <ItemInfo rotulo="Usuário">{u.usuario}</ItemInfo>
          <ItemInfo rotulo="Perfil">{PAPEIS[u.papel]}</ItemInfo>
          <ItemInfo rotulo="E-mail">{u.email}</ItemInfo>
        </dl>
      </Painel>
      <TrocarSenha />
    </Pagina>
  );
}
