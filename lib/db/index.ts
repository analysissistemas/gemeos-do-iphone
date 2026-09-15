import "server-only";
import { Pool } from "@neondatabase/serverless";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

/* Pool do driver serverless da Neon (WebSocket): permite transação de verdade,
   que a venda e a mudança de etapa precisam. Um pool por instância; a Vercel
   fecha as conexões ociosas antes de congelar a função. */
const globalParaPool = globalThis as unknown as { __gmPool?: Pool };

function criarPool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não configurada");
  const pool = new Pool({ connectionString: url, max: 5 });
  attachDatabasePool(pool);
  return pool;
}

const pool = globalParaPool.__gmPool ?? criarPool();
if (process.env.NODE_ENV !== "production") globalParaPool.__gmPool = pool;

export const db = drizzle({ client: pool, schema, casing: "snake_case" });
export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export { schema };
