import "server-only";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export type Pessoa = { id: number; nome: string; papel: string };

export async function listarEquipe(): Promise<Pessoa[]> {
  return db
    .select({ id: schema.usuarios.id, nome: schema.usuarios.nome, papel: schema.usuarios.papel })
    .from(schema.usuarios)
    .where(eq(schema.usuarios.ativo, true))
    .orderBy(asc(schema.usuarios.nome));
}

export async function listarUnidades() {
  return db
    .select({ id: schema.unidades.id, nome: schema.unidades.nome })
    .from(schema.unidades)
    .where(eq(schema.unidades.ativo, true))
    .orderBy(asc(schema.unidades.nome));
}
