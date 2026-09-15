import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import { LOGO_PNG, LOGO_PROPORCAO } from "./logo";

/* Documento próprio para o cliente — não é impressão da tela.
   Fonte padrão (Helvetica) cobre acentos do português. Sem emoji e sem
   símbolos fora do Latin-1 (✓, setas): eles viram quadrado no PDF. */
export const cores = { tinta: "#14150f", tinta2: "#4a4c45", tinta3: "#7a7c75", linha: "#dcdcd4", fundo: "#f6f6f3", marca: "#f2c518", preto: "#0b0b0a" };

export const e = StyleSheet.create({
  pagina: { paddingTop: 0, paddingBottom: 56, paddingHorizontal: 0, fontSize: 9.5, color: cores.tinta, fontFamily: "Helvetica", lineHeight: 1.4 },
  corpo: { paddingHorizontal: 36 },
  topo: { backgroundColor: cores.preto, paddingHorizontal: 36, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  topoTitulo: { color: "#ffffff", fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "right" },
  topoSub: { color: "#bdbdb5", fontSize: 8.5, textAlign: "right", marginTop: 2 },
  faixaMarca: { height: 3, backgroundColor: cores.marca },
  secao: { marginBottom: 14 },
  secaoTitulo: { fontSize: 8, fontFamily: "Helvetica-Bold", color: cores.tinta3, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6, paddingBottom: 3, borderBottomWidth: 0.7, borderBottomColor: cores.linha },
  grade: { flexDirection: "row", flexWrap: "wrap" },
  item: { width: "50%", marginBottom: 6, paddingRight: 10 },
  itemTerco: { width: "33.33%", marginBottom: 6, paddingRight: 10 },
  itemInteiro: { width: "100%", marginBottom: 6 },
  rotulo: { fontSize: 7.5, color: cores.tinta3, marginBottom: 1 },
  valor: { fontSize: 10 },
  valorForte: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  tabela: { borderWidth: 0.7, borderColor: cores.linha, borderRadius: 4 },
  tabLinha: { flexDirection: "row", borderBottomWidth: 0.7, borderBottomColor: cores.linha, paddingVertical: 5, paddingHorizontal: 8 },
  tabCab: { backgroundColor: cores.fundo },
  texto: { fontSize: 9, color: cores.tinta2, textAlign: "justify" },
  destaque: { backgroundColor: cores.fundo, borderRadius: 6, padding: 10, flexDirection: "row", justifyContent: "space-between" },
  assinaturas: { flexDirection: "row", gap: 24, marginTop: 10 },
  caixaAssinatura: { flex: 1, alignItems: "center" },
  linhaAssinatura: { borderTopWidth: 0.8, borderTopColor: cores.tinta, width: "100%", marginTop: 4, paddingTop: 4, alignItems: "center" },
  rodape: { position: "absolute", bottom: 20, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: cores.tinta3, borderTopWidth: 0.6, borderTopColor: cores.linha, paddingTop: 6 },
  registro: { marginTop: 10, padding: 8, borderWidth: 0.7, borderColor: cores.linha, borderRadius: 4, fontSize: 7.5, color: cores.tinta2 },
});

export function Topo({ titulo, sub }: { titulo: string; sub: string }) {
  return (
    <View fixed>
      <View style={e.topo}>
        <Image src={LOGO_PNG} style={{ width: 120, height: 120 * LOGO_PROPORCAO }} />
        <View>
          <Text style={e.topoTitulo}>{titulo}</Text>
          <Text style={e.topoSub}>{sub}</Text>
        </View>
      </View>
    </View>
  );
}

export function Secao({ titulo, children, quebra = true }: { titulo: string; children: React.ReactNode; quebra?: boolean }) {
  return (
    <View style={e.secao} wrap={quebra}>
      <Text style={e.secaoTitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

export function Item({ rotulo, valor, largura = "meia", forte }: { rotulo: string; valor?: string | number | null; largura?: "meia" | "terco" | "inteira"; forte?: boolean }) {
  const estilo = largura === "inteira" ? e.itemInteiro : largura === "terco" ? e.itemTerco : e.item;
  return (
    <View style={estilo}>
      <Text style={e.rotulo}>{rotulo}</Text>
      <Text style={forte ? e.valorForte : e.valor}>{valor == null || valor === "" ? "—" : String(valor)}</Text>
    </View>
  );
}

export function Rodape({ esquerda }: { esquerda: string }) {
  return (
    <View style={e.rodape} fixed>
      <Text>{esquerda}</Text>
      <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
    </View>
  );
}

export const reais = (v: number | null | undefined) =>
  v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
export const dataHoraPdf = (d: Date | string | null | undefined) =>
  d ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Recife", dateStyle: "short", timeStyle: "short" }).format(new Date(d)) : "—";
export const dataPdf = (d: Date | string | null | undefined) =>
  d ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Recife", dateStyle: "long" }).format(new Date(d)) : "—";
