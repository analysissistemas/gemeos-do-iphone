import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import type { SnapshotVenda } from "@/lib/servicos/vendas";
import { cores, dataHoraPdf, dataPdf, e, Item, reais, Rodape, Secao, Topo } from "./comum";

export type AssinaturaPdf = {
  modo: string;
  assinanteNome: string | null;
  assinanteCpf: string | null;
  assinaturaImagem: string | null;
  assinadoEm: Date | null;
  ip: string | null;
  confirmadoPor?: string | null;
} | null;

export function DocumentoVenda({ s, hash, assinatura, rascunho }: { s: SnapshotVenda; hash: string | null; assinatura: AssinaturaPdf; rascunho?: boolean }) {
  const codigo = hash ? hash.slice(0, 16).toUpperCase() : "PRÉVIA — NÃO VÁLIDO";
  return (
    <Document title={`${s.numero} — Termo de venda de veículo`} author={s.empresa.nome} subject="Termo de venda de veículo" language="pt-BR">
      <Page size="A4" style={e.pagina}>
        <Topo titulo="Termo de Venda de Veículo" sub={`${s.numero} · emitido em ${dataHoraPdf(s.geradoEm)}`} />
        <View style={e.corpo}>
          {rascunho && (
            <Text style={{ marginBottom: 10, padding: 6, backgroundColor: "#fdf0c0", color: "#6b5200", fontSize: 8.5, textAlign: "center" }}>
              Prévia: este documento ainda não foi gerado para assinatura.
            </Text>
          )}

          <Secao titulo="Vendedor">
            <View style={e.grade}>
              <Item rotulo="Empresa" valor={[s.empresa.nome, s.empresa.razaoSocial].filter(Boolean).join(" · ")} />
              <Item rotulo="CNPJ" valor={s.empresa.cnpj} />
              <Item rotulo="Endereço" valor={s.empresa.endereco} />
              <Item rotulo="Contato" valor={[s.empresa.telefone, s.empresa.instagram].filter(Boolean).join(" · ")} />
              <Item rotulo="Consultor responsável" valor={s.vendedor} />
            </View>
          </Secao>

          <Secao titulo="Comprador">
            <View style={e.grade}>
              <Item rotulo="Nome completo" valor={s.cliente.nome} forte />
              <Item rotulo="CPF" valor={s.cliente.cpf} forte />
              <Item rotulo="Telefone" valor={s.cliente.telefone} />
              <Item rotulo="E-mail" valor={s.cliente.email} />
              <Item rotulo="Endereço" valor={s.cliente.endereco} largura="inteira" />
            </View>
          </Secao>

          <Secao titulo="Veículo">
            <View style={e.grade}>
              <Item rotulo="Tipo" valor={s.veiculo.tipo} largura="terco" />
              <Item rotulo="Marca / modelo" valor={[s.veiculo.marca, s.veiculo.modelo].filter(Boolean).join(" ")} largura="terco" forte />
              <Item rotulo="Cor" valor={s.veiculo.cor} largura="terco" />
              <Item rotulo="Ano" valor={s.veiculo.ano} largura="terco" />
              <Item rotulo="Placa" valor={s.veiculo.placa ?? "Não se aplica"} largura="terco" />
              <Item rotulo="Quilometragem" valor={s.veiculo.km != null ? `${s.veiculo.km.toLocaleString("pt-BR")} km` : null} largura="terco" />
              <Item rotulo="Chassi" valor={s.veiculo.chassi} largura="terco" />
              <Item rotulo="Renavam" valor={s.veiculo.renavam ?? "Não se aplica"} largura="terco" />
              <Item rotulo="Condição" valor={s.veiculo.condicao} largura="terco" />
            </View>
          </Secao>

          <Secao titulo="Valores" quebra={false}>
            <View style={e.destaque}>
              <View>
                <Text style={e.rotulo}>Valor anunciado</Text>
                <Text style={e.valor}>{reais(s.valores.anunciado)}</Text>
              </View>
              {s.valores.desconto > 0 && (
                <View>
                  <Text style={e.rotulo}>Desconto concedido</Text>
                  <Text style={e.valor}>{reais(s.valores.desconto)}</Text>
                </View>
              )}
              {s.entrada > 0 && (
                <View>
                  <Text style={e.rotulo}>Entrada</Text>
                  <Text style={e.valor}>{reais(s.entrada)}</Text>
                </View>
              )}
              <View>
                <Text style={e.rotulo}>Valor negociado</Text>
                <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold" }}>{reais(s.valores.vendido)}</Text>
              </View>
            </View>
          </Secao>

          <Secao titulo="Forma de pagamento" quebra={false}>
            <View style={e.tabela}>
              <View style={[e.tabLinha, e.tabCab]}>
                <Text style={{ flex: 2, fontFamily: "Helvetica-Bold", fontSize: 8.5 }}>Forma</Text>
                <Text style={{ flex: 3, fontFamily: "Helvetica-Bold", fontSize: 8.5 }}>Detalhe</Text>
                <Text style={{ flex: 1.4, fontFamily: "Helvetica-Bold", fontSize: 8.5, textAlign: "right" }}>Valor</Text>
              </View>
              {s.pagamentos.map((p, i) => (
                <View key={i} style={[e.tabLinha, i === s.pagamentos.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                  <Text style={{ flex: 2 }}>{p.forma}</Text>
                  <Text style={{ flex: 3, color: cores.tinta2 }}>{[p.entrada ? "Entrada" : null, p.detalhe].filter(Boolean).join(" · ") || "—"}</Text>
                  <Text style={{ flex: 1.4, textAlign: "right" }}>{reais(p.valor)}</Text>
                </View>
              ))}
            </View>
            <Text style={{ marginTop: 4, textAlign: "right", fontFamily: "Helvetica-Bold" }}>Total: {reais(s.pagamentos.reduce((t, p) => t + p.valor, 0))}</Text>
          </Secao>

          {s.documentacao.length > 0 && (
            <Secao titulo="Documentação conferida">
              {s.documentacao.map((d, i) => (
                <Text key={i} style={e.texto}>
                  • {d}
                </Text>
              ))}
            </Secao>
          )}

          <Secao titulo="Condições da venda">
            {s.condicoesPadrao && <Text style={e.texto}>{s.condicoesPadrao}</Text>}
            {s.condicoes && <Text style={[e.texto, { marginTop: 4 }]}>{s.condicoes}</Text>}
            {s.observacoes && (
              <Text style={[e.texto, { marginTop: 4 }]}>
                Observações: {s.observacoes}
              </Text>
            )}
          </Secao>

          <View wrap={false}>
            <Text style={[e.texto, { marginTop: 4, marginBottom: 18 }]}>
              As partes declaram estar de acordo com as informações acima. {s.empresa.endereco ? s.empresa.endereco.split(" — ")[0] : "Pernambuco"}, {dataPdf(assinatura?.assinadoEm ?? s.geradoEm)}.
            </Text>
            <View style={e.assinaturas}>
              <View style={e.caixaAssinatura}>
                <View style={{ height: 52, justifyContent: "flex-end", alignItems: "center" }}>
                  {assinatura?.assinaturaImagem && <Image src={assinatura.assinaturaImagem} style={{ height: 50, maxWidth: 200, objectFit: "contain" }} />}
                </View>
                <View style={e.linhaAssinatura}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>{assinatura?.assinanteNome ?? s.cliente.nome}</Text>
                  <Text style={{ fontSize: 8, color: cores.tinta3 }}>Comprador · CPF {s.cliente.cpf}</Text>
                </View>
              </View>
              <View style={e.caixaAssinatura}>
                <View style={{ height: 52 }} />
                <View style={e.linhaAssinatura}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>{s.empresa.nome}</Text>
                  <Text style={{ fontSize: 8, color: cores.tinta3 }}>Vendedor{s.vendedor ? ` · ${s.vendedor}` : ""}</Text>
                </View>
              </View>
            </View>

            {assinatura && assinatura.assinadoEm && (
              <View style={e.registro}>
                {assinatura.modo === "eletronica" ? (
                  <Text>
                    Registro de aceite eletrônico: documento visualizado e assinado na tela por {assinatura.assinanteNome} (CPF informado confere com o cadastro) em{" "}
                    {dataHoraPdf(assinatura.assinadoEm)}, IP {assinatura.ip ?? "não identificado"}. Código do documento: {codigo}. Este registro não é assinatura digital com certificado ICP-Brasil.
                  </Text>
                ) : (
                  <Text>
                    Assinatura presencial: o comprador {assinatura.assinanteNome} assinou a via impressa deste documento, confirmado no sistema por {assinatura.confirmadoPor ?? "a loja"} em{" "}
                    {dataHoraPdf(assinatura.assinadoEm)}. Código do documento: {codigo}.
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
        <Rodape esquerda={`${s.empresa.nome} · ${s.numero} · código ${codigo}`} />
      </Page>
    </Document>
  );
}
