/* Formatação em português, igual no servidor e no navegador (fuso de Recife). */
export const FUSO = "America/Recife";

export const soDigitos = (s: string | null | undefined) => (s ?? "").replace(/\D/g, "");

export function brl(v: number | null | undefined, casas = 0) {
  if (v == null || Number.isNaN(v)) return "—";
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}
export const brlCentavos = (v: number | null | undefined) => brl(v, 2);

export function numeroCompacto(v: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(v);
}

const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, ...o });
const fData = fmt({ day: "2-digit", month: "2-digit", year: "numeric" });
const fDataCurta = fmt({ day: "2-digit", month: "2-digit" });
const fHora = fmt({ hour: "2-digit", minute: "2-digit" });
const fDataHora = fmt({ day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fDiaSemana = fmt({ weekday: "long", day: "2-digit", month: "long" });

export function comoData(d: Date | string | null | undefined) {
  if (d == null || d === "") return null;
  if (d instanceof Date) return d;
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T12:00:00-03:00` : d);
}

export const data = (d: Date | string | null | undefined) => (comoData(d) ? fData.format(comoData(d)!) : "—");
export const dataCurta = (d: Date | string | null | undefined) => (comoData(d) ? fDataCurta.format(comoData(d)!) : "—");
export const hora = (d: Date | string | null | undefined) => (comoData(d) ? fHora.format(comoData(d)!) : "—");
export const dataHora = (d: Date | string | null | undefined) =>
  comoData(d) ? fDataHora.format(comoData(d)!).replace(",", " às") : "—";
export const diaPorExtenso = (d: Date | string | null | undefined) => (comoData(d) ? fDiaSemana.format(comoData(d)!) : "—");

/** "agora", "há 5 min", "há 3 h", "ontem", "há 4 dias", ou a data. */
export function relativo(d: Date | string | null | undefined, agora = new Date()) {
  const x = comoData(d);
  if (!x) return "—";
  const s = Math.round((agora.getTime() - x.getTime()) / 1000);
  if (s < 60) return "agora";
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  const dias = Math.floor(s / 86400);
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;
  return data(x);
}

/** Duração legível desde uma data: "3 h", "2 dias". */
export function tempoDesde(d: Date | string | null | undefined, agora = new Date()) {
  const x = comoData(d);
  if (!x) return "—";
  const min = Math.max(0, Math.round((agora.getTime() - x.getTime()) / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const dias = Math.floor(h / 24);
  return `${dias} ${dias === 1 ? "dia" : "dias"}`;
}

/** Chave do dia no fuso da loja: "2026-09-14". */
export function chaveDia(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function formatarCpf(cpf: string | null | undefined) {
  const d = soDigitos(cpf);
  return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : cpf || "—";
}
export function formatarCep(cep: string | null | undefined) {
  const d = soDigitos(cep);
  return d.length === 8 ? d.replace(/(\d{5})(\d{3})/, "$1-$2") : cep || "—";
}
export function formatarTelefone(t: string | null | undefined) {
  let d = soDigitos(t);
  if (!d) return "—";
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return t ?? d;
}
/** Telefone brasileiro no formato do WhatsApp: 55 + DDD + número. */
export function telefoneWhatsapp(t: string | null | undefined) {
  const d = soDigitos(t);
  if (!d) return "";
  if (d.startsWith("55") && d.length >= 12) return d;
  return d.length >= 10 ? `55${d}` : d;
}
export function formatarPlaca(p: string | null | undefined) {
  const s = (p ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return s.length === 7 ? `${s.slice(0, 3)}-${s.slice(3)}` : s || "—";
}

export function validarCpf(cpf: string) {
  const d = soDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const dig = (n: number) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dig(9) === Number(d[9]) && dig(10) === Number(d[10]);
}

export function iniciais(nome: string | null | undefined) {
  const p = (nome ?? "").trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "?";
  return ((p[0][0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

export const km = (v: number | null | undefined) => (v == null ? "—" : `${v.toLocaleString("pt-BR")} km`);
export const numeroDoc = (prefixo: string, id: number) => `${prefixo}-${String(id).padStart(5, "0")}`;

/** Dias desde uma data (fração). Lê o relógio: use para exibição relativa. */
export function diasDesde(d: Date | string) {
  return (Date.now() - new Date(d).getTime()) / 86400000;
}
/** A data já passou? */
export const jaPassou = (d: Date | string) => new Date(d).getTime() < Date.now();
/** Chave do dia de hoje no fuso da loja. */
export const chaveHoje = () => chaveDia(new Date());
