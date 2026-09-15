"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { CANAIS_RECEBIMENTO, TIPOS_OS } from "@/lib/dominio";
import { data, km } from "@/lib/formato";
import { Painel } from "@/components/ui/basicos";
import { Botao } from "@/components/ui/botao";
import { AreaTexto, Campo, Entrada, Selecao } from "@/components/ui/campos";
import { SeletorCliente } from "@/components/clientes/seletor-cliente";
import { acaoAbrirOs, acaoVeiculosDoCliente } from "../acoes";

type Comprado = { vendaId: number; veiculoId: number; descricao: string; placa: string | null; chassi: string | null; km: number | null; finalizadaEm: Date | null };

export function FormularioOs({
  equipe,
  unidades,
  clienteInicial,
  usuarioId,
}: {
  equipe: { id: number; nome: string; papel: string }[];
  unidades: { id: number; nome: string }[];
  clienteInicial: { id: number; nome: string } | null;
  usuarioId: number;
}) {
  const [cliente, setCliente] = useState(clienteInicial);
  const [compradosDe, setCompradosDe] = useState<{ clienteId: number; itens: Comprado[] } | null>(null);
  const [f, setF] = useState({
    tipo: "assistencia",
    veiculoId: "" as string,
    vendaId: "" as string,
    veiculoDescricao: "",
    placa: "",
    chassi: "",
    km: "",
    unidadeId: unidades[0] ? String(unidades[0].id) : "",
    canalRecebimento: "loja",
    problemaRelatado: "",
    observacoes: "",
    tecnicoId: "",
    previsaoEntrega: "",
  });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [pendente, iniciar] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (cliente) acaoVeiculosDoCliente(cliente.id).then((itens) => setCompradosDe({ clienteId: cliente.id, itens }));
  }, [cliente]);
  const comprados = cliente && compradosDe?.clienteId === cliente.id ? compradosDe.itens : [];

  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  return (
    <Painel className="p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        <Campo rotulo="Cliente" obrigatorio erro={erros.clienteId} className="sm:col-span-4">
          <SeletorCliente valor={cliente} aoMudar={setCliente} equipe={equipe} invalido={!!erros.clienteId} />
        </Campo>
        <Campo rotulo="Tipo" obrigatorio className="sm:col-span-2">
          <Selecao value={f.tipo} onChange={(e) => set("tipo", e.target.value)}>
            {Object.entries(TIPOS_OS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Selecao>
        </Campo>

        {comprados.length > 0 && (
          <Campo rotulo="Veículo comprado na loja" dica="Escolha para preencher os dados e ligar a OS à venda (útil na garantia)." className="sm:col-span-6">
            <Selecao
              value={f.vendaId}
              onChange={(e) => {
                const c = comprados.find((x) => String(x.vendaId) === e.target.value);
                setF((x) => ({
                  ...x,
                  vendaId: e.target.value,
                  veiculoId: c ? String(c.veiculoId) : "",
                  veiculoDescricao: c?.descricao ?? x.veiculoDescricao,
                  placa: c?.placa ?? x.placa,
                  chassi: c?.chassi ?? x.chassi,
                }));
              }}
            >
              <option value="">Outro veículo</option>
              {comprados.map((c) => (
                <option key={c.vendaId} value={c.vendaId}>
                  {c.descricao} · comprado em {data(c.finalizadaEm)}
                  {c.km != null ? ` · ${km(c.km)} na venda` : ""}
                </option>
              ))}
            </Selecao>
          </Campo>
        )}

        <Campo rotulo="Veículo" obrigatorio erro={erros.veiculoDescricao} className="sm:col-span-3">
          <Entrada value={f.veiculoDescricao} onChange={(e) => set("veiculoDescricao", e.target.value)} placeholder="Ex.: TANK AG11 branca" invalido={!!erros.veiculoDescricao} />
        </Campo>
        <Campo rotulo="Placa" className="sm:col-span-1">
          <Entrada value={f.placa} onChange={(e) => set("placa", e.target.value.toUpperCase())} placeholder="Se tiver" />
        </Campo>
        <Campo rotulo="Quilometragem" erro={erros.km} className="sm:col-span-2">
          <Entrada inputMode="numeric" value={f.km} onChange={(e) => set("km", e.target.value.replace(/\D/g, ""))} />
        </Campo>
        <Campo rotulo="Chassi" className="sm:col-span-2">
          <Entrada value={f.chassi} onChange={(e) => set("chassi", e.target.value.toUpperCase())} />
        </Campo>
        <Campo rotulo="Onde foi recebida" obrigatorio className="sm:col-span-2">
          <Selecao value={f.canalRecebimento} onChange={(e) => set("canalRecebimento", e.target.value)}>
            {Object.entries(CANAIS_RECEBIMENTO).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Selecao>
        </Campo>
        <Campo rotulo="Loja" className="sm:col-span-2">
          <Selecao value={f.unidadeId} onChange={(e) => set("unidadeId", e.target.value)}>
            <option value="">—</option>
            {unidades.map((un) => (
              <option key={un.id} value={un.id}>
                {un.nome}
              </option>
            ))}
          </Selecao>
        </Campo>
        <Campo rotulo="Problema relatado pelo cliente" obrigatorio erro={erros.problemaRelatado} className="sm:col-span-6">
          <AreaTexto value={f.problemaRelatado} onChange={(e) => set("problemaRelatado", e.target.value)} placeholder="Nas palavras do cliente: o que acontece, desde quando, em que situação." invalido={!!erros.problemaRelatado} />
        </Campo>
        <Campo rotulo="Observações da recepção" className="sm:col-span-6">
          <AreaTexto value={f.observacoes} onChange={(e) => set("observacoes", e.target.value)} placeholder="Estado em que chegou, acessórios deixados, chave, carregador…" />
        </Campo>
        <Campo rotulo="Técnico responsável" className="sm:col-span-3">
          <Selecao value={f.tecnicoId} onChange={(e) => set("tecnicoId", e.target.value)}>
            <option value="">Definir no atendimento</option>
            {equipe.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
                {p.id === usuarioId ? " (você)" : ""}
              </option>
            ))}
          </Selecao>
        </Campo>
        <Campo rotulo="Previsão de entrega" className="sm:col-span-3">
          <Entrada type="date" value={f.previsaoEntrega} onChange={(e) => set("previsaoEntrega", e.target.value)} />
        </Campo>
      </div>
      <div className="mt-6 flex justify-end gap-2 border-t border-linha pt-4">
        <Botao variante="fantasma" onClick={() => router.back()}>
          Cancelar
        </Botao>
        <Botao
          variante="primario"
          carregando={pendente}
          onClick={() =>
            iniciar(async () => {
              const r = await acaoAbrirOs({ ...f, clienteId: cliente?.id ?? "" });
              if (!r.ok) {
                setErros(r.campos ?? {});
                toast.error(r.erro);
                return;
              }
              toast.success(r.mensagem);
              router.push(`/sistema/assistencia/${r.dados.id}`);
            })
          }
        >
          Abrir OS
        </Botao>
      </div>
    </Painel>
  );
}
