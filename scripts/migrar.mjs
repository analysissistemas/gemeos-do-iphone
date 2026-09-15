/* Aplica as migrations de drizzle/ no banco apontado por DATABASE_URL.
   Rodar: npm run db:migrate  (lê .env.local) */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não configurada");
const db = drizzle(neon(url));
await migrate(db, { migrationsFolder: "drizzle" });
console.log("migrations aplicadas");
