import "server-only";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/* scrypt do próprio Node: sem dependência nativa (bcrypt quebra em serverless).
   Formato guardado: scrypt$N$r$p$sal$hash (base64). O mesmo formato é gerado
   por scripts/semear.mjs — se mudar aqui, mude lá. */
const scrypt = promisify(scryptCb) as (s: string, salt: Buffer, len: number, o: object) => Promise<Buffer>;
const N = 16384, R = 8, P = 1, TAM = 32;

export async function gerarHash(senha: string) {
  const sal = randomBytes(16);
  const hash = await scrypt(senha, sal, TAM, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${sal.toString("base64")}$${hash.toString("base64")}`;
}

export async function conferirSenha(senha: string, guardado: string) {
  const [alg, n, r, p, salB64, hashB64] = guardado.split("$");
  if (alg !== "scrypt" || !salB64 || !hashB64) return false;
  const esperado = Buffer.from(hashB64, "base64");
  const obtido = await scrypt(senha, Buffer.from(salB64, "base64"), esperado.length, {
    N: Number(n), r: Number(r), p: Number(p),
  });
  return esperado.length === obtido.length && timingSafeEqual(esperado, obtido);
}
