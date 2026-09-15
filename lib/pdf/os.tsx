import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { DetalheOs } from "@/lib/consultas/os";
import { CANAIS_RECEBIMENTO, RESULTADOS_OS, TIPOS_OS, rotuloStatusOs } from "@/lib/dominio";
import { formatarCpf, formatarPlaca, formatarTelefone, numeroDoc } from "@/lib/formato";
import { cores, dataHoraPdf, dataPdf, e, Item, reais, Rodape, Secao, Topo } from "./comum";

type Empresa = { nome: string; cnpj: string | null; endereco: string | null; telefone: string | null; condicoesOs: string | null };

export function DocumentoOs({ d, empresa }: { d: DetalheOs; empresa: Empresa }) {
  const os = d.os;
  const numero = numeroDoc("OS", os.id);
  const pecas = d.itens.filter((i) => i.tipo === "peca");
  const servicos = d.itens.filter((i) => i.tipo === "servico");
  const total = d.itens.reduce((s, i) => s + i.quantidade * i.valorUnitario, 0);
  const texto = (v: string | null | undefined) => v?.trim() || "Não registrado";

  return (
    <Document title={`${numero} — Ordem de serviço`} author={empresa.nome} language="pt-BR">
      <Page size="A4" style={e.pagina}>
        <Topo titulo={`Ordem de Serviço · ${TIPOS_OS[os.tipo as keyof typeof TIPOS_OS]}`} sub={`${numero} · ${rotuloStatusOs(os.status)} · emitida em ${dataHoraPdf(new Date())}`} />
        <View style={e.corpo}>
          <Secao titulo="Empresa">
            <View style={e.grade}>
              <Item rotulo="Empresa" valor={empresa.nome} />
              <Item rotulo="CNPJ" valor={empresa.cnpj} />
              <Item rotulo="Endereço" valor={empresa.endereco} />
              <Item rotulo="Contato" valor={empresa.telefone ? formatarTelefone(empresa.telefone) : null} />
            </View>
          </Secao>

          <Secao titulo="Cliente e veículo">
            <View style={e.grade}>
              <Item rotulo="Cliente" valor={d.cliente.nome} forte />
              <Item rotulo="CPF" valor={d.cliente.cpf ? formatarCpf(d.cliente.cpf) : null} />
              <Item rotulo="Telefone" valor={formatarTelefone(d.cliente.whatsapp ?? d.cliente.telefone)} />
              <Item rotulo="Veículo" valor={os.veiculoDescricao} forte />
              <Item rotulo="Placa" valor={os.placa ? formatarPlaca(os.placa) : "Não se aplica"} largura="terco" />
              <Item rotulo="Quilometragem" valor={os.km != null ? `${os.km.toLocaleString("pt-BR")} km` : null} largura="terco" />
              <Item rotulo="Chassi" valor={os.chassi} largura="terco" />
            </View>
          </Secao>

          <Secao titulo="Recebimento e responsáveis">
            <View style={e.grade}>
              <Item rotulo="Recebida" valor={[CANAIS_RECEBIMENTO[os.canalRecebimento as keyof typeof CANAIS_RECEBIMENTO], d.unidade ? `loja ${d.unidade}` : null].filter(Boolean).join(" · ")} largura="terco" />
              <Item rotulo="Abertura" valor={`${dataHoraPdf(os.abertaEm)}${d.abriu ? ` · ${d.abriu}` : ""}`} largura="terco" />
              <Item rotulo="Recebida por" valor={d.recebeu ? `${d.recebeu} · ${dataHoraPdf(os.recebidaEm)}` : null} largura="terco" />
              <Item rotulo="Técnico responsável" valor={d.tecnico} largura="terco" />
              <Item rotulo="Finalizada" valor={d.finalizou ? `${d.finalizou} · ${dataHoraPdf(os.finalizadaEm)}` : null} largura="terco" />
              <Item rotulo="Entregue" valor={d.entregou ? `${d.entregou} · ${dataHoraPdf(os.entregueEm)}` : null} largura="terco" />
              <Item rotulo="Previsão de entrega" valor={os.previsaoEntrega ? dataPdf(os.previsaoEntrega + "T12:00:00-03:00") : null} largura="terco" />
              <Item rotulo="Situação" valor={rotuloStatusOs(os.status)} largura="terco" />
              <Item rotulo="Resultado" valor={os.resultado ? RESULTADOS_OS[os.resultado as keyof typeof RESULTADOS_OS] : null} largura="terco" />
            </View>
          </Secao>

          <Secao titulo="Problema relatado pelo cliente">
            <Text style={e.texto}>{os.problemaRelatado}</Text>
          </Secao>
          <Secao titulo="Diagnóstico técnico">
            <Text style={e.texto}>{texto(os.diagnosticoTecnico)}</Text>
          </Secao>
          <Secao titulo="Solução aplicada e serviços realizados">
            <Text style={e.texto}>{texto(os.solucaoAplicada)}</Text>
            {os.servicosRealizados && <Text style={[e.texto, { marginTop: 4 }]}>{os.servicosRealizados}</Text>}
          </Secao>

          {d.itens.length > 0 && (
            <Secao titulo="Peças e serviços" quebra={false}>
              <View style={e.tabela}>
                <View style={[e.tabLinha, e.tabCab]}>
                  <Text style={{ flex: 1, fontFamily: "Helvetica-Bold", fontSize: 8.5 }}>Tipo</Text>
                  <Text style={{ flex: 4, fontFamily: "Helvetica-Bold", fontSize: 8.5 }}>Descrição</Text>
                  <Text style={{ flex: 0.8, fontFamily: "Helvetica-Bold", fontSize: 8.5, textAlign: "right" }}>Qtd.</Text>
                  <Text style={{ flex: 1.5, fontFamily: "Helvetica-Bold", fontSize: 8.5, textAlign: "right" }}>Unitário</Text>
                  <Text style={{ flex: 1.5, fontFamily: "Helvetica-Bold", fontSize: 8.5, textAlign: "right" }}>Total</Text>
                </View>
                {[...pecas, ...servicos].map((i, n, arr) => (
                  <View key={i.id} style={[e.tabLinha, n === arr.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                    <Text style={{ flex: 1, color: cores.tinta2 }}>{i.tipo === "peca" ? "Peça" : "Serviço"}</Text>
                    <Text style={{ flex: 4 }}>{i.descricao}</Text>
                    <Text style={{ flex: 0.8, textAlign: "right" }}>{i.quantidade.toLocaleString("pt-BR")}</Text>
                    <Text style={{ flex: 1.5, textAlign: "right" }}>{reais(i.valorUnitario)}</Text>
                    <Text style={{ flex: 1.5, textAlign: "right" }}>{reais(i.quantidade * i.valorUnitario)}</Text>
                  </View>
                ))}
              </View>
              <Text style={{ marginTop: 4, textAlign: "right", fontFamily: "Helvetica-Bold" }}>Total: {reais(total)}</Text>
            </Secao>
          )}

          {os.observacoes && (
            <Secao titulo="Observações">
              <Text style={e.texto}>{os.observacoes}</Text>
            </Secao>
          )}
          {empresa.condicoesOs && (
            <Secao titulo="Condições">
              <Text style={e.texto}>{empresa.condicoesOs}</Text>
            </Secao>
          )}

          <View wrap={false} style={{ marginTop: 8 }}>
            <View style={e.assinaturas}>
              <View style={e.caixaAssinatura}>
                <View style={{ height: 40 }} />
                <View style={e.linhaAssinatura}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>{d.cliente.nome}</Text>
                  <Text style={{ fontSize: 8, color: cores.tinta3 }}>Cliente · {os.status === "entregue" ? "recebi o veículo" : "autorizo o serviço"}</Text>
                </View>
              </View>
              <View style={e.caixaAssinatura}>
                <View style={{ height: 40 }} />
                <View style={e.linhaAssinatura}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>{d.tecnico ?? empresa.nome}</Text>
                  <Text style={{ fontSize: 8, color: cores.tinta3 }}>Responsável técnico · {empresa.nome}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <Rodape esquerda={`${empresa.nome} · ${numero}`} />
      </Page>
    </Document>
  );
}
