import { Sparkles } from "lucide-react";
import type { DiagnosticoPerda } from "@/lib/db/schema";
import { MOTIVOS_PERDA } from "@/lib/dominio";
import { Selo } from "@/components/ui/basicos";

const CLASSES: Record<string, string> = { ...MOTIVOS_PERDA, atendimento: "Atendimento", indefinida: "Indefinida" };

export function CartaoDiagnostico({ d, quando }: { d: DiagnosticoPerda; quando?: string }) {
  return (
    <div className="rounded-2xl border border-linha-forte bg-vidro p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Sparkles className="size-4 text-marca" />
        <p className="font-semibold">Diagnóstico da IA</p>
        <Selo tom="info" ponto={false}>
          {CLASSES[d.classificacao] ?? d.classificacao}
        </Selo>
        <Selo tom={d.confianca === "alta" ? "bom" : d.confianca === "media" ? "atencao" : "serio"}>Confiança {d.confianca === "media" ? "média" : d.confianca}</Selo>
        {quando && <span className="ml-auto text-[11.5px] text-ink-3">{quando}</span>}
      </div>
      <dl className="flex flex-col gap-3 text-[13.5px]">
        <Bloco rotulo="Provável motivo da perda">{d.provavelMotivo}</Bloco>
        {d.objecoes.length > 0 && (
          <Bloco rotulo="Objeções identificadas">
            <ul className="list-disc pl-5">
              {d.objecoes.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </Bloco>
        )}
        <Bloco rotulo="Quando o interesse caiu">{d.momentoPerdaInteresse}</Bloco>
        <Bloco rotulo="Comportamento do cliente">{d.comportamentoCliente}</Bloco>
        <Bloco rotulo="O que poderia ter aumentado a chance">{d.acaoQuePoderiaAjudar}</Bloco>
        <Bloco rotulo="Recomendação para o consultor">{d.recomendacaoConsultor}</Bloco>
        {d.lacunas.length > 0 && (
          <Bloco rotulo="Faltou informação sobre">
            <span className="text-ink-2">{d.lacunas.join("; ")}</span>
          </Bloco>
        )}
      </dl>
      <p className="mt-3 text-[11.5px] text-ink-3">Gerado só com o que está registrado no atendimento. É apoio à gestão, não conclusão.</p>
    </div>
  );
}

function Bloco({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11.5px] font-medium uppercase tracking-wide text-ink-3">{rotulo}</dt>
      <dd className="mt-0.5 leading-relaxed">{children}</dd>
    </div>
  );
}
