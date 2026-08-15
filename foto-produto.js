/* ============================================================
   TIRAR / ANEXAR FOTO DO PRODUTO
   ------------------------------------------------------------
   Usado pela área do vendedor (index.html). A vitrine só lê o resultado.

   Por que reduzir antes de salvar: a foto de um celular moderno tem 3 a 6 MB.
   O navegador guarda no máximo uns 5 MB no total — cinco fotos e acabou o
   espaço, com erro no meio do cadastro. Aqui a imagem é redesenhada em no
   máximo 900px e salva em JPEG, o que derruba para 60–120 KB sem estragar a
   qualidade no tamanho em que ela aparece no site.
   ============================================================ */

const FOTO_MAX_LADO = 900;      // o dobro do tamanho que aparece na tela
const FOTO_QUALIDADE = 0.78;    // acima disso o arquivo cresce sem ganho visível

/* ============================================================
   ONDE A FOTO FICA GUARDADA
   ------------------------------------------------------------
   Mora aqui, e não no estoque.js, de propósito: o index.html ainda tem a
   própria cópia dos dados e não carrega o estoque.js. Mantendo este arquivo
   sem dependência nenhuma, o recurso funciona nos dois lados hoje.

   ⚠️ Guarda no navegador DESTA máquina (localStorage, teto de ~5 MB). Quem
   abrir de outro computador não vê estas fotos. Quando houver servidor, só
   estas três funções mudam.
   ============================================================ */
const FOTO_CHAVE = "gemeos-fotos";

function _fotosLer(){
  try{ return JSON.parse(localStorage.getItem(FOTO_CHAVE) || "{}"); }
  catch(e){ return {}; }
}
function _fotosGravar(obj){
  try{ localStorage.setItem(FOTO_CHAVE, JSON.stringify(obj)); return true; }
  catch(e){ return false; }        // false = navegador sem espaço
}

/** Foto que a loja tirou deste produto, ou null. */
function fotoManual(id){
  const f = _fotosLer()[id];
  return (typeof f === "string" && f.startsWith("data:")) ? f : null;
}
/** Grava a foto. Passar null apaga e volta para a oficial, se houver. */
function definirFotoManual(id, dataUrl){
  const m = _fotosLer();
  if(dataUrl === null || dataUrl === undefined) delete m[id];
  else m[id] = dataUrl;
  return _fotosGravar(m);
}
/** Quantas fotos já foram tiradas e quanto espaço ocupam. */
function resumoFotosManuais(){
  const m = _fotosLer();
  const ids = Object.keys(m);
  return {
    quantas: ids.length,
    mb: +(ids.reduce((s,k)=>s+m[k].length,0)/1024/1024).toFixed(2)
  };
}
/** A foto que vale para ESTE produto: a da loja primeiro, a oficial depois.
 *  O `typeof` protege o index.html, que não carrega o estoque.js e portanto
 *  não tem fotoDe — lá só existe a foto tirada na loja. */
function fotoDoProduto(p){
  const propria = fotoManual(p.id);
  if(propria) return propria;
  if(typeof fotoDe === "function") return fotoDe(p.modelo, p.cor);
  return null;
}

/** Lê o arquivo escolhido, reduz e devolve a imagem pronta para guardar. */
function prepararFoto(arquivo){
  return new Promise((ok, erro) => {
    if(!arquivo || !arquivo.type.startsWith("image/"))
      return erro(new Error("Isso não é uma imagem."));

    const leitor = new FileReader();
    leitor.onerror = () => erro(new Error("Não consegui ler o arquivo."));
    leitor.onload = () => {
      const im = new Image();
      im.onerror = () => erro(new Error("Arquivo de imagem danificado."));
      im.onload = () => {
        let {width: w, height: h} = im;
        if(Math.max(w, h) > FOTO_MAX_LADO){
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
function escolherFoto(aoEscolher){
  const inp = document.createElement("input");
  inp.type = "file";
  inp.accept = "image/*";
  inp.capture = "environment";      // câmera traseira no celular
  inp.style.display = "none";
  inp.onchange = () => {
    const a = inp.files && inp.files[0];
    inp.remove();
    if(a) aoEscolher(a);
  };
  document.body.appendChild(inp);
  inp.click();
}

/** Fluxo completo: escolher → reduzir → salvar. Chama `aoTerminar(resultado)`. */
function anexarFotoAoProduto(id, aoTerminar){
  escolherFoto(async arquivo => {
    try{
      const r = await prepararFoto(arquivo);
      const kbDepois = Math.round(r.dataUrl.length * 0.75 / 1024);
      if(!definirFotoManual(id, r.dataUrl)){
        // localStorage cheio: avisa em vez de falhar calado
        aoTerminar({ok:false, motivo:
          "O navegador ficou sem espaço para guardar mais fotos. Apague " +
          "alguma foto antiga antes de anexar esta."});
        return;
      }
      aoTerminar({ok:true, kbAntes:r.kbAntes, kbDepois,
                  medidas:`${r.largura}x${r.altura}`});
    }catch(e){
      aoTerminar({ok:false, motivo:e.message});
    }
  });
}
