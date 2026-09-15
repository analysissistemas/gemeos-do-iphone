"use client";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import type { DiagnosticoPerda } from "@/lib/db/schema";
import { MOTIVOS_PERDA } from "@/lib/dominio";
import { Botao } from "@/components/ui/botao";
import { AreaTexto, Campo, Entrada, Selecao } from "@/components/ui/campos";
import { Dialogo, RodapeDialogo } from "@/components/ui/dialogo";
import { acaoGerarDiagnostico, acaoMarcarPerdido } from "@/app/sistema/funil/acoes";
import { CartaoDiagnostico } from "./diagnostico";

type Alvo = { id: number; cliente: string; responsavelId: number | null };

/* Encerrar como perdida é um processo: o consultor conta o que houve,
   e a IA lê o atendimento inteiro para diagnosticar. O negócio fica
   perdido mesmo se a IA falhar — o diagnóstico pode ser pedido de novo. */
export function DialogoPerda({
  negocio,
  equipe,
  aoMudar,
  aoConcluir,
}: {
  negocio: Alvo | null;
  equipe: { id: number; nome: string }[];
  aoMudar: (v: boolean) => void;
  aoConcluir: () => void;
}) {
  /* o corpo avisa se já encerrou; fechar depois disso atualiza a tela de trás */
  const encerrou = useRef(false);
  const fechar = () => {
    aoMudar(false);
    if (encerrou.current) {
      encerrou.current = false;
      aoConcluir();
    }
  };
  return (
    <Dialogo aberto={!!negocio} aoMudar={(v) => (v ? aoMudar(true) : fechar())} titulo="Venda perdida" descricao={negocio ? `Negócio de ${negocio.cliente}` : undefined} largura="lg">
      {negocio && <CorpoPerda key={negocio.id} negocio={negocio} equipe={equipe} aoEncerrar={() => (encerrou.current = true)} aoFechar={fechar} aoCancelar={() => aoMudar(false)} />}
    </Dialogo>
  );
}

function CorpoPerda({
  negocio,
  equipe,
  aoEncerrar,
  aoFechar,
  aoCancelar,
}: {
  negocio: Alvo;
  equipe: { id: number; nome: string }[];
  aoEncerrar: () => void;
  aoFechar: () => void;
  aoCancelar: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [objecao, setObjecao] = useState("");
  const [obs, setObs] = useState("");
  const [humano, setHumano] = useState(negocio.responsavelId ? String(negocio.responsavelId) : "");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [fase, setFase] = useState<"form" | "diagnosticando" | "pronto" | "semIa">("form");
  const [diag, setDiag] = useState<DiagnosticoPerda | null>(null);
  const [erroIa, setErroIa] = useState("");
  const [pendente, iniciar] = useTransition();

  async function diagnosticar() {
    setFase("diagnosticando");
    const r = await acaoGerarDiagnostico(negocio.id);
    if (r.ok) {
      setDiag(r.dados);
      setFase("pronto");
    } else {
      setErroIa(r.erro);
      setFase("semIa");
    }
  }

  return (
    <>
      {fase === "form" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <p className="text-[13.5px] text-ink-2 sm:col-span-2">Conte o que aconteceu. Depois a IA lê o histórico e o atendimento para diagnosticar a perda.</p>
          <Campo rotulo="Motivo da perda" obrigatorio erro={erros.motivo} className="sm:col-span-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(MOTIVOS_PERDA).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setMotivo(k)}
                  aria-pressed={motivo === k}
                  className={`rounded-xl border px-3 py-2.5 text-left text-[13px] transition ${motivo === k ? "border-ink bg-ink font-semibold text-contra-ink" : "border-linha hover:border-linha-forte"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </Campo>
          <Campo rotulo="Objeção principal do cliente" dica="Nas palavras do cliente, se possível.">
            <Entrada value={objecao} onChange={(e) => setObjecao(e.target.value)} placeholder="Ex.: achou o valor acima do orçamento" />
          </Campo>
          <Campo rotulo="Quem conduziu o atendimento humano" dica="Quem assumiu depois da triagem da IA.">
            <Selecao value={humano} onChange={(e) => setHumano(e.target.value)}>
              <option value="">Não houve atendimento humano</option>
              {equipe.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </Selecao>
          </Campo>
          <Campo rotulo="Observações do consultor" obrigatorio erro={erros.observacoes} className="sm:col-span-2">
            <AreaTexto value={obs} onChange={(e) => setObs(e.target.value)} placeholder="O que aconteceu na negociação, em poucas frases." />
          </Campo>
        </div>
      )}
      {fase === "diagnosticando" && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Sparkles className="size-6 animate-pulse text-marca" />
          <p className="font-semibold">A IA está lendo o atendimento…</p>
          <p className="max-w-sm text-[13px] text-ink-2">Ela usa só o histórico, as mensagens e as suas observações. Leva alguns segundos.</p>
        </div>
      )}
      {fase === "pronto" && diag && (
        <>
          <p className="mb-3 text-[13.5px]">
            Negócio encerrado como <b>venda perdida</b>.
          </p>
          <CartaoDiagnostico d={diag} />
        </>
      )}
      {fase === "semIa" && (
        <div className="rounded-2xl border border-linha p-4 text-[13.5px]">
          <p className="font-semibold">O negócio foi encerrado, mas o diagnóstico não foi gerado.</p>
          <p className="mt-1 text-ink-2">{erroIa}</p>
          <p className="mt-2 text-ink-3">Você pode tentar de novo agora ou depois, pelo detalhe do negócio.</p>
        </div>
      )}

      <RodapeDialogo>
        {fase === "form" ? (
          <>
            <Botao variante="fantasma" onClick={aoCancelar}>
              Cancelar
            </Botao>
            <Botao
              variante="perigo"
              carregando={pendente}
              onClick={() =>
                iniciar(async () => {
                  const r = await acaoMarcarPerdido({ negocioId: negocio.id, motivo, objecao, observacoes: obs, atendimentoHumanoId: humano });
                  if (!r.ok) {
                    setErros(r.campos ?? {});
                    toast.error(r.erro);
                    return;
                  }
                  aoEncerrar();
                  toast.success(r.mensagem);
                  await diagnosticar();
                })
              }
            >
              Encerrar e gerar diagnóstico
            </Botao>
          </>
        ) : (
          <>
            {fase === "semIa" && (
              <Botao onClick={diagnosticar}>
                <Sparkles className="size-4" /> Tentar o diagnóstico de novo
              </Botao>
            )}
            <Botao variante="primario" onClick={aoFechar} disabled={fase === "diagnosticando"}>
              Concluir
            </Botao>
          </>
        )}
      </RodapeDialogo>
    </>
  );
}
