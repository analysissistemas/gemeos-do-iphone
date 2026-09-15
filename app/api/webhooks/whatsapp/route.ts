import { createHmac, timingSafeEqual } from "node:crypto";
import { after, NextResponse, type NextRequest } from "next/server";
import { aplicarStatus, executarTriagem, receberMensagem, triagemAutomaticaLigada } from "@/lib/mensageria/servico";
import { obterProvedor } from "@/lib/mensageria/provedores";
import type { MensagemEntrante, TipoMensagem } from "@/lib/mensageria/tipos";

/* ============================================================
   WEBHOOK DO WHATSAPP (Cloud API da Meta) — PREPARADO
   ------------------------------------------------------------
   Enquanto o sistema estiver no modo simulado, este endereço responde
   503 e não aceita nada: não existe integração falsa.
   Para ligar: configurar WHATSAPP_* e MENSAGERIA_PROVEDOR=whatsapp_cloud
   e cadastrar https://<site>/api/webhooks/whatsapp no app da Meta.
   ============================================================ */

const desligado = () => NextResponse.json({ erro: "WhatsApp real não configurado (sistema em modo simulado)" }, { status: 503 });

/** Validação do webhook pela Meta (hub.challenge). */
export async function GET(req: NextRequest) {
  if (obterProvedor().simulado || !process.env.WHATSAPP_VERIFY_TOKEN) return desligado();
  const p = req.nextUrl.searchParams;
  if (p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return NextResponse.json({ erro: "token de verificação não confere" }, { status: 403 });
}

type ValorMeta = {
  contacts?: { profile?: { name?: string }; wa_id?: string }[];
  messages?: { id: string; from: string; type: string; text?: { body?: string }; image?: { id: string; caption?: string; mime_type?: string }; document?: { id: string; filename?: string; mime_type?: string; caption?: string }; audio?: { id: string; mime_type?: string } }[];
  statuses?: { id: string; status: "sent" | "delivered" | "read" | "failed"; errors?: { title?: string }[] }[];
};

export async function POST(req: NextRequest) {
  if (obterProvedor().simulado || !process.env.WHATSAPP_APP_SECRET) return desligado();
  const bruto = await req.text();
  const assinatura = req.headers.get("x-hub-signature-256") ?? "";
  const esperado = "sha256=" + createHmac("sha256", process.env.WHATSAPP_APP_SECRET).update(bruto).digest("hex");
  if (assinatura.length !== esperado.length || !timingSafeEqual(Buffer.from(assinatura), Buffer.from(esperado))) {
    return NextResponse.json({ erro: "assinatura inválida" }, { status: 401 });
  }
  const corpo = JSON.parse(bruto) as { entry?: { changes?: { value?: ValorMeta }[] }[] };
  const recebidas: MensagemEntrante[] = [];
  for (const entrada of corpo.entry ?? []) {
    for (const mudanca of entrada.changes ?? []) {
      const v = mudanca.value ?? {};
      for (const s of v.statuses ?? []) if (s.status !== "sent") await aplicarStatus(s.id, s.status, s.errors?.[0]?.title);
      for (const m of v.messages ?? []) {
        const nome = v.contacts?.find((c) => c.wa_id === m.from)?.profile?.name ?? null;
        const tipo: TipoMensagem = m.type === "text" ? "texto" : m.type === "image" ? "imagem" : m.type === "document" ? "documento" : m.type === "audio" ? "audio" : "texto";
        /* mídia real chega como id da Meta; baixar e guardar é o próximo passo da integração */
        recebidas.push({
          canal: "whatsapp",
          provedor: "whatsapp_cloud",
          telefone: m.from,
          nomeContato: nome,
          externoId: m.id,
          tipo,
          conteudo: m.text?.body ?? m.image?.caption ?? m.document?.caption ?? (tipo === "texto" ? `[${m.type}]` : null),
          metadados: { mediaId: m.image?.id ?? m.document?.id ?? m.audio?.id, mime: m.image?.mime_type ?? m.document?.mime_type ?? m.audio?.mime_type, arquivo: m.document?.filename },
        });
      }
    }
  }
  const conversas: number[] = [];
  for (const m of recebidas) {
    const r = await receberMensagem(m);
    if (r.conversaId && r.modo === "ia") conversas.push(r.conversaId);
  }
  /* responde rápido para a Meta; a triagem roda depois */
  if (conversas.length && (await triagemAutomaticaLigada())) after(async () => {
    for (const id of new Set(conversas)) await executarTriagem(id);
  });
  return NextResponse.json({ ok: true });
}
