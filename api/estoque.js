/* ============================================================
   API DO ESTOQUE — o "portão" que o index.html usa pra gravar de verdade
   ------------------------------------------------------------
   Roda no servidor da Vercel, nunca no navegador do cliente. É o único
   lugar que tem a chave service_role (acesso total ao banco) — o mesmo
   padrão já usado em foto-produto.js, só que agora para produto/modelo
   em vez de foto.

   Ações (campo "acao" no corpo do POST):
     criar_produto   → acha ou cria o modelo, cria o produto
     marcar_vendido  → produto some da vitrine e do estoque disponível
     editar_produto  → atualiza preço/observação/na_vitrine de um produto
   ============================================================ */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function sb(caminho, opcoes = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${caminho}`, {
    ...opcoes,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(opcoes.headers || {})
    }
  });
  if (!r.ok) {
    const corpo = await r.text();
    throw new Error(`Supabase ${r.status} em ${caminho}: ${corpo}`);
  }
  const texto = await r.text();
  return texto ? JSON.parse(texto) : null;
}

/** Acha o modelo pelo nome exato; cria se não existir ainda. */
async function acharOuCriarModelo({ tipo, marca, modelo, versao, categoria, ficha_tecnica }) {
  const existentes = await sb(
    `modelos?select=id&modelo=eq.${encodeURIComponent(modelo)}&marca=eq.${encodeURIComponent(marca)}&limit=1`
  );
  if (existentes && existentes.length) return existentes[0].id;

  const criado = await sb("modelos", {
    method: "POST",
    body: JSON.stringify([{ tipo, marca, modelo, versao: versao || null, categoria: categoria || null, ficha_tecnica: ficha_tecnica || null }])
  });
  return criado[0].id;
}

async function criarProduto(dados) {
  const modelo_id = await acharOuCriarModelo(dados.modeloInfo);
  const produto = {
    modelo_id,
    cor: dados.cor || null,
    armazenamento: dados.armazenamento || null,
    condicao: dados.condicao || null,
    bateria: dados.bateria ?? null,
    imei: dados.imei || null,
    avarias: dados.avarias || [],
    selos: dados.selos || [],
    custo_aquisicao: dados.custo ?? null,
    preco: dados.preco,
    quantidade: dados.quantidade ?? 1,
    data_entrada: dados.data_entrada || null,
    observacao: dados.observacao || null,
    status: "disponivel",
    na_vitrine: dados.na_vitrine ?? true
  };
  const criado = await sb("produtos", { method: "POST", body: JSON.stringify([produto]) });
  return criado[0];
}

async function marcarVendido(id) {
  const r = await sb(`produtos?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "vendido" })
  });
  return r[0];
}

async function editarProduto(id, campos) {
  const permitido = ["preco", "observacao", "na_vitrine", "condicao", "bateria", "cor", "armazenamento", "quantidade", "avarias", "selos", "imei", "custo_aquisicao"];
  const corpo = {};
  for (const k of permitido) if (campos[k] !== undefined) corpo[k] = campos[k];
  const r = await sb(`produtos?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(corpo)
  });
  return r[0];
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, erro: "Só POST." });
    return;
  }
  try {
    const { acao } = req.body || {};
    if (acao === "criar_produto") {
      const produto = await criarProduto(req.body);
      res.status(200).json({ ok: true, produto });
    } else if (acao === "marcar_vendido") {
      const produto = await marcarVendido(req.body.id);
      res.status(200).json({ ok: true, produto });
    } else if (acao === "editar_produto") {
      const produto = await editarProduto(req.body.id, req.body.campos || {});
      res.status(200).json({ ok: true, produto });
    } else {
      res.status(400).json({ ok: false, erro: "Ação desconhecida." });
    }
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message });
  }
};
