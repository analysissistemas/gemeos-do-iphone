import { expect, type Locator, type Page } from "@playwright/test";

/* marca de tudo que o teste cria — scripts/limpar-e2e.mjs apaga por ela */
export const RODADA = Date.now().toString(36).slice(-5).toUpperCase();
export const MARCA = `E2E ${RODADA}`;

export const ADMIN = {
  usuario: process.env.E2E_ADMIN_USUARIO ?? "admin",
  senha: process.env.E2E_ADMIN_SENHA ?? "",
};

/** CPF com dígitos verificadores válidos (número inventado para teste). */
export function cpfValido(): string {
  const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  if (new Set(n).size === 1) n[0] = (n[0] + 1) % 10;
  const dv = (base: number[]) => {
    const s = base.reduce((acc, d, i) => acc + d * (base.length + 1 - i), 0);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  const d1 = dv(n);
  const d2 = dv([...n, d1]);
  return [...n, d1, d2].join("");
}

/** Celular de Pernambuco inventado: 81 9 xxxx-xxxx. */
export const celular = () => `819${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`;

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Campo pelo rótulo visível, com ou sem o " *" de obrigatório. */
export const campo = (raiz: Page | Locator, rotulo: string) => raiz.getByLabel(new RegExp(`^${escapar(rotulo)}( \\*)?$`));

export const aviso = (page: Page, texto: string | RegExp) => page.locator("[data-sonner-toast]").filter({ hasText: texto }).first();
export const avisoErro = (page: Page) => page.locator('[data-sonner-toast][data-type="error"]').last();

export async function entrar(page: Page, usuario: string, senha: string) {
  await page.goto("/login");
  await page.getByLabel("Usuário", { exact: true }).fill(usuario);
  await page.getByLabel("Senha", { exact: true }).fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/sistema/, { timeout: 45_000 });
}

/** Dinheiro no CampoDinheiro: "12500" vira R$ 12.500,00. */
export const reais = (valor: number) => String(Math.round(valor * 100));

export async function semRolagemLateral(page: Page) {
  const { largura, tela } = await page.evaluate(() => ({ largura: document.documentElement.scrollWidth, tela: window.innerWidth }));
  expect(largura, `a página rola para o lado (${largura}px numa tela de ${tela}px)`).toBeLessThanOrEqual(tela + 1);
}
