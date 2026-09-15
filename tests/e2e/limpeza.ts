import { execFileSync } from "node:child_process";

/* no fim da rodada, apaga o que os testes criaram (marca E2E).
   E2E_MANTER=1 deixa os dados para olhar na tela depois. */
export default function limpeza() {
  if (process.env.E2E_MANTER === "1") return;
  execFileSync(process.execPath, ["--env-file=.env.local", "scripts/limpar-e2e.mjs"], { stdio: "inherit" });
}
