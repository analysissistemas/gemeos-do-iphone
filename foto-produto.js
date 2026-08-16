/* ============================================================
   TIRAR / ANEXAR FOTO DO PRODUTO
   ------------------------------------------------------------
   Usado pela área do vendedor (index.html). A vitrine só lê o resultado.

   Por que reduzir antes de enviar: a foto de um celular moderno tem 3 a 6 MB.
   Aqui a imagem é redesenhada em no máximo 900px e salva em JPEG, o que
   derruba para 60–120 KB sem estragar a qualidade no tamanho em que ela
   aparece no site — e sobe bem mais rápido numa conexão de loja.
   ============================================================ */

const FOTO_MAX_LADO = 900;      // o dobro do tamanho que aparece na tela
const FOTO_QUALIDADE = 0.78;    // acima disso o arquivo cresce sem ganho visível

/* ============================================================
   ONDE A FOTO FICA GUARDADA
   ------------------------------------------------------------
   Não fica mais só no navegador — sobe pro banco de dados real (Supabase
   Storage), por um "portão" no n8n que é o único que tem permissão de
   escrever lá (o site só tem permissão de leitura, de propósito — ver
   estoque.js). Assim a foto aparece em qualquer computador, não só no que
   tirou.

   fotoManual(id) fica síncrono checando um Set carregado uma vez ao abrir
   a página (mesma ideia do FOTOS_EXISTENTES dos arquivos estáticos, só que
   buscado do bucket em vez de um arquivo gerado).
   ============================================================ */
const SUPABASE_STORAGE_URL = "https://bzeceniidapsjvaudwwb.supabase.co/storage/v1/object/public/produtos-fotos/";
const N8N_UPLOAD_FOTO_URL = "https://formacao-n8n.flnu5t.easypanel.host/webhook/upload-foto-gemeos";

let _fotosLojaSet = new Set();
async function _carregarFotosLoja() {
  try {
    const r = await fetch("https://bzeceniidapsjvaudwwb.supabase.co/storage/v1/object/list/produtos-fotos", {
      method: "POST",
      headers: { apikey: "sb_publishable_57Nhaiq5oNiuCd5MezKpxw_gn80rCja", "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "", limit: 1000 })
    });
    const objs = await r.json();
    _fotosLojaSet = new Set((Array.isArray(objs) ? objs : []).map(o => o && o.name).filter(Boolean));
  } catch (e) {
    console.error("Não consegui carregar a lista de fotos da loja:", e);
  }
}
/* index.html/vitrine.html esperam essa promessa antes de desenhar a tela
   (junto com ESTOQUE_CARREGADO), senão fotoManual() sempre voltaria "sem
   foto" no primeiro desenho, mesmo pra produto que já tem foto. */
const FOTOS_LOJA_CARREGADO = _carregarFotosLoja();

/** Foto que a loja tirou deste produto, ou null. Síncrono — consulta o Set
 *  carregado por FOTOS_LOJA_CARREGADO, não faz rede a cada chamada. */
function fotoManual(id) {
  const nome = id + ".jpg";
  return _fotosLojaSet.has(nome) ? (SUPABASE_STORAGE_URL + nome) : null;
}
/** Sobe (ou remove, se dataUrl for null) a foto no banco de verdade.
 *  Devolve {ok, motivo} — mesmo formato de antes, pra não mudar quem chama. */
async function definirFotoManual(id, dataUrl) {
  try {
    const r = await fetch(N8N_UPLOAD_FOTO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        dataUrl === null || dataUrl === undefined
          ? { produto_id: id, remover: true }
          : { produto_id: id, imagem_base64: dataUrl }
      )
    });
    const res = await r.json();
    if (!res.ok) return { ok: false, motivo: res.erro || "Não consegui salvar a foto." };
    // atualiza o Set local pra refletir na hora, sem esperar recarregar a página
    const nome = id + ".jpg";
    if (dataUrl === null || dataUrl === undefined) _fotosLojaSet.delete(nome);
    else _fotosLojaSet.add(nome);
    return { ok: true };
  } catch (e) {
    return { ok: false, motivo: "Sem conexão com o servidor — tenta de novo em alguns segundos." };
  }
}
/** Quantas fotos a loja já tem (pra mostrar um resumo depois de anexar). */
function resumoFotosManuais() {
  return { quantas: _fotosLojaSet.size, mb: null }; // mb não se aplica mais (não é mais limite do navegador)
}
/** A foto que vale para ESTE produto: a da loja primeiro, a oficial depois.
 *  O `typeof` protege o index.html, que não carrega estoque.js diretamente
 *  no card — lá só existe a foto tirada na loja. */
function fotoDoProduto(p) {
  const propria = fotoManual(p.id);
  if (propria) return propria;
  if (typeof fotoDe === "function") return fotoDe(p.modelo, p.cor);
  return null;
}

/** Lê o arquivo escolhido, reduz e devolve a imagem pronta para enviar. */
function prepararFoto(arquivo) {
  return new Promise((ok, erro) => {
    if (!arquivo || !arquivo.type.startsWith("image/"))
      return erro(new Error("Isso não é uma imagem."));

    const leitor = new FileReader();
    leitor.onerror = () => erro(new Error("Não consegui ler o arquivo."));
    leitor.onload = () => {
      const im = new Image();
      im.onerror = () => erro(new Error("Arquivo de imagem danificado."));
      im.onload = () => {
        let { width: w, height: h } = im;
        if (Math.max(w, h) > FOTO_MAX_LADO) {
          const f = FOTO_MAX_LADO / Math.max(w, h);
          w = Math.round(w * f);
          h = Math.round(h * f);
        }
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const ctx = c.getContext("2d");
        /* fundo branco: foto de celular pode vir com transparência, e sem isso
           a área vazia sairia preta ao virar JPEG */
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(im, 0, 0, w, h);
        ok({
          dataUrl: c.toDataURL("image/jpeg", FOTO_QUALIDADE),
          largura: w, altura: h,
          kbAntes: Math.round(arquivo.size / 1024)
        });
      };
      im.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

/** Abre o seletor de arquivo. No celular, `capture` faz abrir a câmera direto. */
function escolherFoto(aoEscolher) {
  const inp = document.createElement("input");
  inp.type = "file";
  inp.accept = "image/*";
  inp.capture = "environment";      // câmera traseira no celular
  inp.style.display = "none";
  inp.onchange = () => {
    const a = inp.files && inp.files[0];
    inp.remove();
    if (a) aoEscolher(a);
  };
  document.body.appendChild(inp);
  inp.click();
}

/** Fluxo completo: escolher → reduzir → subir. Chama `aoTerminar(resultado)`. */
function anexarFotoAoProduto(id, aoTerminar) {
  escolherFoto(async arquivo => {
    try {
      const r = await prepararFoto(arquivo);
      const kbDepois = Math.round(r.dataUrl.length * 0.75 / 1024);
      const salvou = await definirFotoManual(id, r.dataUrl);
      if (!salvou.ok) {
        aoTerminar({ ok: false, motivo: salvou.motivo });
        return;
      }
      aoTerminar({ ok: true, kbAntes: r.kbAntes, kbDepois,
                   medidas: `${r.largura}x${r.altura}` });
    } catch (e) {
      aoTerminar({ ok: false, motivo: e.message });
    }
  });
}
