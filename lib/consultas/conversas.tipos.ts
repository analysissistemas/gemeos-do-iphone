/* Valores que a tela (cliente) também usa — fora do módulo server-only. */
export const FILTROS_CONVERSA = {
  todas: "Todas",
  nao_lidas: "Não lidas",
  minhas: "Minhas",
  sem_responsavel: "Sem responsável",
  em_atendimento: "Em atendimento",
  aguardando_cliente: "Aguardando cliente",
  follow_up: "Follow-up",
  negociando: "Em negociação",
  fechada: "Venda fechada",
  perdida: "Venda perdida",
} as const;
export type FiltroConversa = keyof typeof FILTROS_CONVERSA;
