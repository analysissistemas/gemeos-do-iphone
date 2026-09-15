import { FUSO, chaveDia, hora } from "@/lib/formato";

export const ETIQUETA_ETAPA: Record<string, string> = {
  whatsapp: "WhatsApp",
  proposta: "Proposta",
  negociando: "Negociando",
  fechada: "Fechada",
  perdida: "Perdida",
};

/** "14:32", "Ontem", "seg.", "12/09" — como a lista do WhatsApp. */
export function horaLista(d: Date | string | null | undefined) {
  if (!d) return "";
  const x = new Date(d);
  const hoje = chaveDia(new Date());
  const ontem = chaveDia(new Date(Date.now() - 86400000));
  const k = chaveDia(x);
  if (k === hoje) return hora(x);
  if (k === ontem) return "Ontem";
  if (Date.now() - x.getTime() < 6 * 86400000) return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, weekday: "short" }).format(x);
  return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit" }).format(x);
}

/** Separador de data dentro do chat. */
export function rotuloDia(d: Date | string) {
  const x = new Date(d);
  const k = chaveDia(x);
  if (k === chaveDia(new Date())) return "Hoje";
  if (k === chaveDia(new Date(Date.now() - 86400000))) return "Ontem";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, day: "numeric", month: "long", year: x.getFullYear() === new Date().getFullYear() ? undefined : "numeric" }).format(x);
}

/** Quebra o texto em pedaços de texto e link, sem HTML. */
export function comLinks(texto: string) {
  const partes: { t: string; link?: boolean }[] = [];
  const re = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g;
  let ult = 0;
  for (const m of texto.matchAll(re)) {
    if (m.index! > ult) partes.push({ t: texto.slice(ult, m.index) });
    partes.push({ t: m[0], link: true });
    ult = m.index! + m[0].length;
  }
  if (ult < texto.length) partes.push({ t: texto.slice(ult) });
  return partes;
}

export const EMOJIS = ["😀", "😁", "😂", "🙂", "😉", "😊", "😍", "🤝", "👍", "👏", "🙏", "💪", "🔥", "✅", "⚡", "🏍️", "🛵", "🚗", "🔧", "📍", "📄", "💰", "📅", "⏰", "❤️", "🎉", "🤔", "😅", "👀", "📸"];
