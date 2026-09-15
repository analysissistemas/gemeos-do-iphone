import { defineConfig } from "@playwright/test";

/* ============================================================
   TESTES DE PONTA A PONTA
   Rodam num navegador de verdade (o Chrome instalado), contra o site
   rodando e o banco configurado em .env.local.

   Tudo que os testes criam leva a marca "E2E" (clientes, veículos,
   usuários e.e2e.*) e é apagado no fim por scripts/limpar-e2e.mjs —
   nenhum dado que não foi criado pelo teste é tocado.

   Uso:
     npm run dev -- -p 3100            (em outro terminal)
     E2E_ADMIN_SENHA=... npm run test:e2e
   ============================================================ */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  reporter: [["list"]],
  globalTeardown: "./tests/e2e/limpeza.ts",
  use: {
    baseURL: process.env.E2E_URL ?? "http://localhost:3100",
    channel: "chrome",
    locale: "pt-BR",
    timezoneId: "America/Recife",
    viewport: { width: 1366, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
