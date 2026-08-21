/* ============================================================
   API DA FOTO — sobe direto pro Supabase Storage, sem passar pelo n8n.
   ------------------------------------------------------------
   Roda no servidor da Vercel (Node.js de verdade, sem sandbox), com a
   chave service_role só aqui — nunca chega no navegador do cliente.

   Por que não usar o gatilho do n8n pra isso: o node Code de lá roda
   num sandbox que não reconhece o Buffer da imagem como dado binário de
   verdade, e a foto acaba salva como texto (JSON do Buffer) em vez de
   imagem. Aqui, com Node.js real, isso não acontece.
   ============================================================ */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "produtos-fotos";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, erro: "Só POST." });
    return;
  }
  try {
    /* chave: modelo+cor (ex. "iphone-13-pro-max-dourado"), não o id da peça
       física — uma foto serve pra qualquer unidade daquela cor do modelo.
       Calculada em chaveFotoLoja() (estoque.js), a mesma nos dois lados. */
    const { chave, imagem_base64, remover } = req.body || {};
    if (!chave) {
      res.status(400).json({ ok: false, erro: "chave obrigatória." });
      return;
    }
    const path = `${chave}.jpg`;
    const headers = {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`
    };

    if (remover) {
      await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, { method: "DELETE", headers });
      res.status(200).json({ ok: true, removido: true });
      return;
    }

    const base64 = (imagem_base64 || "").replace(/^data:image\/\w+;base64,/, "");
    if (!base64) {
      res.status(400).json({ ok: false, erro: "imagem_base64 obrigatório." });
      return;
    }
    const buffer = Buffer.from(base64, "base64");

    const put = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "image/jpeg", "x-upsert": "true" },
      body: buffer
    });
    if (!put.ok) {
      throw new Error(`upload falhou: ${put.status} ${await put.text()}`);
    }

    res.status(200).json({ ok: true, url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}` });
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message });
  }
};
