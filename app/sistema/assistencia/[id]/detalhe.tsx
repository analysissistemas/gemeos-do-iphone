"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowLeft, Check, Copy, Download, ExternalLink, Plus, Printer, Sparkles, Trash } from "lucide-react";
import type { DetalheOs } from "@/lib/consultas/os";
import { CANAIS_RECEBIMENTO, RESULTADOS_OS, STATUS_OS, TIPOS_OS, rotuloStatusOs, type StatusOs } from "@/lib/dominio";
import { brl, data, dataHora, formatarPlaca, formatarTelefone, km, numeroDoc, telefoneWhatsapp } from "@/lib/formato";
import { cn } from "@/lib/cn";
import { LinhaDoTempo } from "@/components/ui/abas";
import { ItemInfo, Painel, Selo, TituloSecao } from "@/components/ui/basicos";
import { Botao, classesBotao } from "@/components/ui/botao";
import { AreaTexto, Campo, CampoDinheiro, Entrada, Selecao } from "@/components/ui/campos";
import { Dialogo } from "@/components/ui/dialogo";
import { acaoAdicionarItem, acaoAtualizarOs, acaoIaOs, acaoRemoverItem, acaoStatusOs } from "../acoes";

const ROTULO_ACAO: Partial<Record<StatusOs, string>> = {
  aguardando: "Receber OS",
  analise: "Iniciar análise",
  execucao: "Iniciar execução",
  aguardando_peca: "Aguardando peça",
  finalizada: "Finalizar",
  entregue: "Registrar entrega",
  cancelada: "Cancelar OS",
};

export function DetalheOsTela({ d, equipe, proximos, podeEditar }: { d: DetalheOs; equipe: { id: number; nome: string }[]; proximos: StatusOs[]; podeEditar: boolean }) {
  const os = d.os;
  const router = useRouter();
  const encerrada = os.status === "entregue" || os.status === "cancelada";
  const editavel = podeEditar && !encerrada;
  const [f, setF] = useState({
    diagnosticoTecnico: os.diagnosticoTecnico ?? "",
    solucaoAplicada: os.solucaoAplicada ?? "",
    servicosRealizados: os.servicosRealizados ?? "",
    observacoes: os.observacoes ?? "",
    resultado: os.resultado ?? "",
    previsaoEntrega: os.previsaoEntrega ?? "",
    tecnicoId: os.tecnicoId ? String(os.tecnicoId) : "",
    km: os.km != null ? String(os.km) : "",
  });
  const [item, setItem] = useState<{ tipo: "peca" | "servico"; descricao: string; quantidade: string; valorUnitario: number | null }>({ tipo: "peca", descricao: "", quantidade: "1", valorUnitario: null });
  const [cancelar, setCancelar] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [pendente, iniciar] = useTransition();
  const [pendenteIa, iniciarIa] = useTransition();

  const idxAtual = STATUS_OS.findIndex((s) => s.id === os.status);
  const totalPecas = d.itens.filter((i) => i.tipo === "peca").reduce((s, i) => s + i.quantidade * i.valorUnitario, 0);
  const totalServicos = d.itens.filter((i) => i.tipo === "servico").reduce((s, i) => s + i.quantidade * i.valorUnitario, 0);
  const alterado =
    f.diagnosticoTecnico !== (os.diagnosticoTecnico ?? "") ||
    f.solucaoAplicada !== (os.solucaoAplicada ?? "") ||
    f.servicosRealizados !== (os.servicosRealizados ?? "") ||
    f.observacoes !== (os.observacoes ?? "") ||
    f.resultado !== (os.resultado ?? "") ||
    f.previsaoEntrega !== (os.previsaoEntrega ?? "") ||
    f.tecnicoId !== (os.tecnicoId ? String(os.tecnicoId) : "") ||
    f.km !== (os.km != null ? String(os.km) : "");

  const salvar = (depois?: () => Promise<void>) =>
    iniciar(async () => {
      if (alterado) {
        const r = await acaoAtualizarOs(os.id, f);
        if (!r.ok) return void toast.error(r.erro);
        if (!depois) toast.success(r.mensagem);
      }
      if (depois) await depois();
      router.refresh();
    });

  const mudar = (destino: StatusOs, obs?: string) =>
    salvar(async () => {
      const r = await acaoStatusOs(os.id, destino, obs);
      if (!r.ok) return void toast.error(r.erro);
      toast.success(`OS: ${rotuloStatusOs(destino)}`);
      setCancelar(false);
    });

  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));
  const ia = os.iaAssistencia;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link href="/sistema/assistencia" className={classesBotao("fantasma", "icone")} aria-label="Voltar">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-[22px] font-bold tracking-tight sm:text-[26px]">
            {numeroDoc("OS", os.id)} · {d.cliente.nome}
          </h1>
          <p className="text-[13px] text-ink-2">
            {os.veiculoDescricao} · aberta em {dataHora(os.abertaEm)}
          </p>
        </div>
        <Selo tom={os.tipo === "garantia" ? "marca" : "neutro"}>{TIPOS_OS[os.tipo as keyof typeof TIPOS_OS]}</Selo>
        <Selo tom={os.status === "entregue" ? "bom" : os.status === "cancelada" ? "critico" : "atencao"}>{rotuloStatusOs(os.status)}</Selo>
      </div>

      {/* fluxo visual da OS */}
      <Painel className="mb-4 p-4 sm:p-5">
        <ol className="rolagem-fina flex items-center gap-1 overflow-x-auto pb-1" aria-label="Andamento da OS">
          {STATUS_OS.map((s, i) => {
            const feito = os.status !== "cancelada" && i < idxAtual;
            const atual = s.id === os.status;
            return (
              <li key={s.id} className="flex shrink-0 items-center gap-1">
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px]",
                    atual ? "border-ink bg-ink font-semibold text-contra-ink" : feito ? "border-linha-forte text-ink" : "border-linha text-ink-3",
                  )}
                  aria-current={atual ? "step" : undefined}
                >
                  {feito && <Check className="size-3.5 text-bom" />}
                  {s.rotulo}
                </span>
                {i < STATUS_OS.length - 1 && <span className="h-px w-3 bg-linha-forte" aria-hidden />}
              </li>
            );
          })}
        </ol>
        {podeEditar && proximos.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-linha pt-4">
            {proximos
              .filter((p) => p !== "cancelada")
              .map((p) => (
                <Botao key={p} variante={p === proximos[0] ? "primario" : "secundario"} carregando={pendente} onClick={() => mudar(p)}>
                  {ROTULO_ACAO[p] ?? rotuloStatusOs(p)}
                </Botao>
              ))}
            {proximos.includes("cancelada") && (
              <Botao variante="fantasma" className="ml-auto" onClick={() => setCancelar(true)}>
                Cancelar OS
              </Botao>
            )}
          </div>
        )}
      </Painel>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Painel className="p-5">
            <TituloSecao>Diagnóstico e serviço</TituloSecao>
            <div className="mb-4 rounded-2xl bg-trilho p-4">
              <p className="text-[11.5px] font-medium uppercase tracking-wide text-ink-3">Problema relatado pelo cliente</p>
              <p className="mt-1 whitespace-pre-line text-[14px]">{os.problemaRelatado}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Campo rotulo="Diagnóstico técnico" className="sm:col-span-2" dica="O que o técnico constatou.">
                <AreaTexto value={f.diagnosticoTecnico} disabled={!editavel} onChange={(e) => set("diagnosticoTecnico", e.target.value)} />
              </Campo>
              <Campo rotulo="Solução aplicada">
                <AreaTexto value={f.solucaoAplicada} disabled={!editavel} onChange={(e) => set("solucaoAplicada", e.target.value)} />
              </Campo>
              <Campo rotulo="Serviços realizados">
                <AreaTexto value={f.servicosRealizados} disabled={!editavel} onChange={(e) => set("servicosRealizados", e.target.value)} />
              </Campo>
              <Campo rotulo="Observações" className="sm:col-span-2">
                <AreaTexto value={f.observacoes} disabled={!editavel} onChange={(e) => set("observacoes", e.target.value)} className="min-h-[64px]" />
              </Campo>
              <Campo rotulo="Resultado">
                <Selecao value={f.resultado} disabled={!editavel} onChange={(e) => set("resultado", e.target.value)}>
                  <option value="">Ainda não definido</option>
                  {Object.entries(RESULTADOS_OS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Selecao>
              </Campo>
              <Campo rotulo="Previsão de entrega">
                <Entrada type="date" value={f.previsaoEntrega} disabled={!editavel} onChange={(e) => set("previsaoEntrega", e.target.value)} />
              </Campo>
            </div>
            {editavel && (
              <div className="mt-4 flex justify-end">
                <Botao variante="primario" disabled={!alterado} carregando={pendente} onClick={() => salvar()}>
                  Salvar
                </Botao>
              </div>
            )}
          </Painel>

          <Painel className="p-5">
            <TituloSecao>Peças e serviços</TituloSecao>
            {d.itens.length === 0 ? (
              <p className="mb-3 text-[13px] text-ink-3">Nenhuma peça ou serviço lançado.</p>
            ) : (
              <div className="mb-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-[13.5px]">
                  <thead className="text-left text-[11.5px] uppercase tracking-wide text-ink-3">
                    <tr className="border-b border-linha">
                      <th className="py-2 font-medium">Item</th>
                      <th className="py-2 text-right font-medium">Qtd.</th>
                      <th className="py-2 text-right font-medium">Unitário</th>
                      <th className="py-2 text-right font-medium">Total</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {d.itens.map((i) => (
                      <tr key={i.id} className="border-b border-linha last:border-0">
                        <td className="py-2">
                          <span className="text-[11px] text-ink-3">{i.tipo === "peca" ? "Peça" : "Serviço"}</span>
                          <span className="block">{i.descricao}</span>
                        </td>
                        <td className="num py-2 text-right">{i.quantidade.toLocaleString("pt-BR")}</td>
                        <td className="num py-2 text-right">{brl(i.valorUnitario, 2)}</td>
                        <td className="num py-2 text-right font-semibold">{brl(i.quantidade * i.valorUnitario, 2)}</td>
                        <td className="py-2 text-right">
                          {editavel && (
                            <Botao
                              variante="fantasma"
                              tamanho="icone"
                              aria-label={`Remover ${i.descricao}`}
                              onClick={() =>
                                iniciar(async () => {
                                  const r = await acaoRemoverItem(os.id, i.id);
                                  if (!r.ok) return void toast.error(r.erro);
                                  router.refresh();
                                })
                              }
                            >
                              <Trash className="size-4" />
                            </Botao>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="num mt-2 text-right text-[13px] text-ink-2">
                  Peças {brl(totalPecas, 2)} · Serviços {brl(totalServicos, 2)} · <b className="text-ink">Total {brl(totalPecas + totalServicos, 2)}</b>
                </p>
              </div>
            )}
            {editavel && (
              <div className="grid grid-cols-1 gap-2 rounded-2xl border border-linha p-3 sm:grid-cols-[110px_1fr_80px_140px_auto] sm:items-end">
                <Campo rotulo="Tipo">
                  <Selecao value={item.tipo} onChange={(e) => setItem((x) => ({ ...x, tipo: e.target.value as "peca" | "servico" }))}>
                    <option value="peca">Peça</option>
                    <option value="servico">Serviço</option>
                  </Selecao>
                </Campo>
                <Campo rotulo="Descrição">
                  <Entrada value={item.descricao} onChange={(e) => setItem((x) => ({ ...x, descricao: e.target.value }))} placeholder="Ex.: Controlador 60V" />
                </Campo>
                <Campo rotulo="Qtd.">
                  <Entrada inputMode="decimal" value={item.quantidade} onChange={(e) => setItem((x) => ({ ...x, quantidade: e.target.value.replace(",", ".") }))} />
                </Campo>
                <Campo rotulo="Valor unitário">
                  <CampoDinheiro valor={item.valorUnitario} aoMudar={(v) => setItem((x) => ({ ...x, valorUnitario: v }))} />
                </Campo>
                <Botao
                  carregando={pendente}
                  onClick={() =>
                    iniciar(async () => {
                      const r = await acaoAdicionarItem(os.id, { ...item, valorUnitario: item.valorUnitario ?? 0 });
                      if (!r.ok) return void toast.error(r.campos ? Object.values(r.campos)[0] : r.erro);
                      setItem({ tipo: item.tipo, descricao: "", quantidade: "1", valorUnitario: null });
                      router.refresh();
                    })
                  }
                >
                  <Plus className="size-4" /> Lançar
                </Botao>
              </div>
            )}
          </Painel>

          <Painel className="p-5">
            <TituloSecao
              acao={
                podeEditar && (
                  <Botao
                    tamanho="sm"
                    carregando={pendenteIa}
                    onClick={() =>
                      iniciarIa(async () => {
                        const r = await acaoIaOs(os.id);
                        if (!r.ok) return void toast.error(r.erro);
                        toast.success(r.mensagem);
                        router.refresh();
                      })
                    }
                  >
                    <Sparkles className="size-4" /> {ia ? "Atualizar" : "Pedir ajuda da IA"}
                  </Botao>
                )
              }
            >
              Apoio da IA
            </TituloSecao>
            {ia ? (
              <div className="flex flex-col gap-3 text-[13.5px]">
                <p className="text-[11.5px] text-ink-3">Gerado em {dataHora(os.iaEm)}. Hipóteses para conferir — a decisão é do técnico.</p>
                <Bloco rotulo="Resumo do problema">{ia.resumoProblema}</Bloco>
                {ia.possiveisCausas.length > 0 && (
                  <Bloco rotulo="Possíveis causas (verificar)">
                    <ol className="list-decimal pl-5">
                      {ia.possiveisCausas.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ol>
                  </Bloco>
                )}
                {ia.verificacoesSugeridas.length > 0 && (
                  <Bloco rotulo="Verificações sugeridas">
                    <ul className="list-disc pl-5">
                      {ia.verificacoesSugeridas.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </Bloco>
                )}
                <Bloco rotulo="Resumo para o consultor">{ia.resumoParaConsultor}</Bloco>
                <div className="rounded-2xl border border-linha p-3">
                  <p className="text-[11.5px] font-medium uppercase tracking-wide text-ink-3">Mensagem para o cliente</p>
                  <p className="mt-1 whitespace-pre-line">{ia.mensagemParaCliente}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Botao
                      tamanho="sm"
                      onClick={async () => {
                        await navigator.clipboard.writeText(ia.mensagemParaCliente);
                        toast.success("Mensagem copiada");
                      }}
                    >
                      <Copy className="size-4" /> Copiar
                    </Botao>
                    {(d.cliente.whatsapp || d.cliente.telefone) && (
                      <a className={classesBotao("secundario", "sm")} target="_blank" rel="noreferrer" href={`https://wa.me/${telefoneWhatsapp(d.cliente.whatsapp ?? d.cliente.telefone)}?text=${encodeURIComponent(ia.mensagemParaCliente)}`}>
                        Enviar no WhatsApp
                      </a>
                    )}
                  </div>
                </div>
                {ia.lacunas.length > 0 && <Bloco rotulo="Faltou informação sobre">{ia.lacunas.join("; ")}</Bloco>}
              </div>
            ) : (
              <p className="text-[13px] text-ink-2">A IA organiza o relato, sugere causas prováveis para o técnico conferir e escreve uma mensagem para o cliente. Ela não substitui a avaliação técnica.</p>
            )}
          </Painel>
        </div>

        <div className="flex flex-col gap-4">
          <Painel className="p-5">
            <TituloSecao>Documento</TituloSecao>
            <div className="flex flex-wrap gap-2">
              <a href={`/api/documentos/os/${os.id}`} target="_blank" rel="noreferrer" className={classesBotao("primario", "sm")}>
                <ExternalLink className="size-4" /> Visualizar PDF
              </a>
              <a href={`/api/documentos/os/${os.id}?baixar=1`} className={classesBotao("secundario", "sm")}>
                <Download className="size-4" /> Baixar
              </a>
              <a href={`/api/documentos/os/${os.id}`} target="_blank" rel="noreferrer" className={classesBotao("secundario", "sm")}>
                <Printer className="size-4" /> Imprimir
              </a>
            </div>
          </Painel>

          <Painel className="p-5">
            <TituloSecao>Responsáveis</TituloSecao>
            <dl className="flex flex-col gap-3">
              <ItemInfo rotulo="Abriu">{d.abriu ? `${d.abriu} · ${dataHora(os.abertaEm)}` : null}</ItemInfo>
              <ItemInfo rotulo="Recebeu">{d.recebeu ? `${d.recebeu} · ${dataHora(os.recebidaEm)}` : "Ainda não recebida"}</ItemInfo>
              <div>
                <dt className="text-[11.5px] text-ink-3">Técnico responsável</dt>
                {editavel ? (
                  <Selecao className="mt-1" value={f.tecnicoId} onChange={(e) => set("tecnicoId", e.target.value)}>
                    <option value="">Não definido</option>
                    {equipe.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </Selecao>
                ) : (
                  <dd className="mt-0.5 text-[13.5px]">{d.tecnico ?? "—"}</dd>
                )}
              </div>
              <ItemInfo rotulo="Finalizou">{d.finalizou ? `${d.finalizou} · ${dataHora(os.finalizadaEm)}` : null}</ItemInfo>
              <ItemInfo rotulo="Entregou">{d.entregou ? `${d.entregou} · ${dataHora(os.entregueEm)}` : null}</ItemInfo>
            </dl>
          </Painel>

          <Painel className="p-5">
            <TituloSecao>Recebimento e veículo</TituloSecao>
            <dl className="grid grid-cols-2 gap-3">
              <ItemInfo rotulo="Onde foi recebida">{CANAIS_RECEBIMENTO[os.canalRecebimento as keyof typeof CANAIS_RECEBIMENTO]}</ItemInfo>
              <ItemInfo rotulo="Loja">{d.unidade}</ItemInfo>
              <ItemInfo rotulo="Placa">{os.placa ? formatarPlaca(os.placa) : null}</ItemInfo>
              <div>
                <dt className="text-[11.5px] text-ink-3">Quilometragem</dt>
                {editavel ? <Entrada className="mt-1 h-9" inputMode="numeric" value={f.km} onChange={(e) => set("km", e.target.value.replace(/\D/g, ""))} /> : <dd className="mt-0.5 text-[13.5px]">{km(os.km)}</dd>}
              </div>
              <ItemInfo rotulo="Chassi" className="col-span-2">
                {os.chassi}
              </ItemInfo>
              <ItemInfo rotulo="Cliente" className="col-span-2">
                <Link href={`/sistema/clientes/${d.cliente.id}`} className="hover:underline">
                  {d.cliente.nome}
                </Link>{" "}
                · {formatarTelefone(d.cliente.whatsapp ?? d.cliente.telefone)}
              </ItemInfo>
              {os.vendaId && (
                <ItemInfo rotulo="Venda de origem" className="col-span-2">
                  <Link href={`/sistema/vendas/${os.vendaId}`} className="hover:underline">
                    {numeroDoc("V", os.vendaId)}
                  </Link>
                </ItemInfo>
              )}
              {os.previsaoEntrega && <ItemInfo rotulo="Previsão">{data(os.previsaoEntrega)}</ItemInfo>}
            </dl>
          </Painel>

          <Painel className="p-5">
            <TituloSecao>Histórico</TituloSecao>
            <LinhaDoTempo itens={d.eventos.map((e) => ({ id: e.id, titulo: e.descricao, quando: dataHora(e.criadoEm), quem: e.usuario }))} />
          </Painel>
        </div>
      </div>

      <Dialogo
        aberto={cancelar}
        aoMudar={setCancelar}
        titulo="Cancelar OS"
        largura="sm"
        rodape={
          <Botao variante="perigo" carregando={pendente} onClick={() => mudar("cancelada", motivo)}>
            Cancelar OS
          </Botao>
        }
      >
        <Campo rotulo="Motivo" obrigatorio>
          <AreaTexto value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </Campo>
      </Dialogo>
    </>
  );
}

function Bloco({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11.5px] font-medium uppercase tracking-wide text-ink-3">{rotulo}</p>
      <div className="mt-0.5 leading-relaxed">{children}</div>
    </div>
  );
}
