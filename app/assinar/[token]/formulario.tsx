"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eraser } from "lucide-react";
import { soDigitos } from "@/lib/formato";
import { Botao } from "@/components/ui/botao";
import { Campo, Entrada } from "@/components/ui/campos";
import { assinarDocumento } from "./acoes";

export function FormularioAssinatura({ token, nomeSugerido }: { token: string; nomeSugerido: string }) {
  const [nome, setNome] = useState(nomeSugerido);
  const [cpf, setCpf] = useState("");
  const [aceite, setAceite] = useState(false);
  const [desenhou, setDesenhou] = useState(false);
  const [pendente, iniciar] = useTransition();
  const canvas = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  /* quadro de assinatura: traço preto sobre branco, em qualquer tela */
  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    /* No celular, rolar a página esconde a barra do navegador e dispara
       "resize" sem a largura mudar: redimensionar o quadro aí apagava a
       assinatura já feita. Só redesenha quando a largura muda de verdade
       (girar o aparelho), e leva o traço junto. */
    let largura = 0;
    const ajustar = () => {
      const r = c.getBoundingClientRect();
      if (Math.round(r.width) === largura) return;
      const antes = largura ? document.createElement("canvas") : null;
      if (antes) {
        antes.width = c.width;
        antes.height = c.height;
        antes.getContext("2d")!.drawImage(c, 0, 0);
      }
      largura = Math.round(r.width);
      const escala = window.devicePixelRatio || 1;
      c.width = r.width * escala;
      c.height = r.height * escala;
      ctx.setTransform(escala, 0, 0, escala, 0, 0);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, r.width, r.height);
      if (antes) ctx.drawImage(antes, 0, 0, r.width, r.height);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#111";
    };
    ajustar();
    let desenhando = false;
    const ponto = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    const inicio = (e: PointerEvent) => {
      desenhando = true;
      c.setPointerCapture(e.pointerId);
      const [x, y] = ponto(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };
    const move = (e: PointerEvent) => {
      if (!desenhando) return;
      const [x, y] = ponto(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      setDesenhou(true);
    };
    const fim = () => (desenhando = false);
    c.addEventListener("pointerdown", inicio);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", fim);
    c.addEventListener("pointercancel", fim);
    window.addEventListener("resize", ajustar);
    return () => {
      c.removeEventListener("pointerdown", inicio);
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerup", fim);
      c.removeEventListener("pointercancel", fim);
      window.removeEventListener("resize", ajustar);
    };
  }, []);

  function limpar() {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const r = c.getBoundingClientRect();
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, r.width, r.height);
    setDesenhou(false);
  }

  return (
    <section className="painel flex flex-col gap-4 p-5">
      <h2 className="text-[17px] font-semibold">Confirme e assine</h2>
      <Campo rotulo="Seu nome completo" obrigatorio>
        <Entrada value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" />
      </Campo>
      <Campo rotulo="Seu CPF" obrigatorio dica="Precisa ser o mesmo do cadastro da compra.">
        <Entrada
          inputMode="numeric"
          value={cpf}
          onChange={(e) => {
            const d = soDigitos(e.target.value).slice(0, 11);
            setCpf(d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2"));
          }}
        />
      </Campo>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[12px] font-medium text-ink-2">
            Assine com o dedo ou o mouse <span className="text-critico">*</span>
          </span>
          <button type="button" onClick={limpar} className="flex items-center gap-1 text-[12.5px] text-ink-3 hover:text-ink">
            <Eraser className="size-3.5" /> Limpar
          </button>
        </div>
        <canvas ref={canvas} className="h-44 w-full touch-none rounded-2xl border border-linha-forte bg-white" aria-label="Quadro de assinatura" />
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-[14px]">
        <input type="checkbox" className="mt-0.5 size-5 accent-[var(--ink)]" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
        <span>Li o documento e concordo com as informações e condições desta compra.</span>
      </label>
      <p className="text-[12px] leading-relaxed text-ink-3">
        Registro de aceite eletrônico: guardamos seu nome, CPF, a assinatura desenhada, data, hora, endereço IP e o código do documento. Não é assinatura digital com certificado
        ICP-Brasil.
      </p>
      <Botao
        variante="primario"
        tamanho="lg"
        disabled={!aceite || !desenhou}
        carregando={pendente}
        onClick={() =>
          iniciar(async () => {
            const imagem = canvas.current!.toDataURL("image/png");
            const r = await assinarDocumento(token, { nome, cpf, aceite, imagem });
            if (!r.ok) return void toast.error(r.erro);
            toast.success("Documento assinado. Obrigado!");
            router.refresh();
          })
        }
      >
        Assinar documento
      </Botao>
    </section>
  );
}
