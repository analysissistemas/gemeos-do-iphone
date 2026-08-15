/* ============================================================
   ESTOQUE COMPARTILHADO — a fonte única da verdade
   ============================================================
   Os DOIS arquivos leem daqui:
     · index.html   (você e a equipe)  — vê custo, lucro, margem
     · vitrine.html (o cliente)        — vê só o preço de venda

   Assim o preço nunca fica escrito dentro do site. Você ajusta na área do
   vendedor e a vitrine muda junto, sem ninguém editar código.

   COMO O PREÇO É GUARDADO
   O preço que você digita fica salvo no navegador (localStorage), por cima do
   valor calculado. Enquanto você não mexer, vale a sugestão do sistema; assim
   que você define um valor, ele manda.

   ⚠️ Limite de hoje: por ser protótipo sem servidor, o preço salvo vale
   NESTE computador e NESTE navegador. Quando o sistema virar de verdade
   (com banco de dados), essa mesma função passa a gravar no servidor e o
   preço vale para todo mundo — o resto do código não muda.
   ============================================================ */

/* gerador com semente fixa: a lista de aparelhos de exemplo é sempre a mesma,
   nas duas telas — senão o cliente veria um estoque e você veria outro */
const _rnd = (s => () => (s = s*16807 % 2147483647) / 2147483647)(42);
const _ent  = (a,b) => Math.floor(_rnd()*(b-a+1))+a;
const _pick = a => a[Math.floor(_rnd()*a.length)];

/* ---------- CATÁLOGO: o que cada geração realmente teve ---------- */
const CATALOGO = {
  "iPhone 7":         {arm:["32GB","128GB","256GB"],            cor:["Preto","Prata","Dourado","Rosé","Vermelho"],                       base:  480},
  "iPhone 7 Plus":    {arm:["32GB","128GB","256GB"],            cor:["Preto","Prata","Dourado","Rosé","Vermelho"],                       base:  620},
  "iPhone 8":         {arm:["64GB","128GB","256GB"],            cor:["Cinza-espacial","Prata","Dourado","Vermelho"],                     base:  680},
  "iPhone 8 Plus":    {arm:["64GB","128GB","256GB"],            cor:["Cinza-espacial","Prata","Dourado","Vermelho"],                     base:  850},
  "iPhone X":         {arm:["64GB","256GB"],                    cor:["Cinza-espacial","Prata"],                                          base:  900},
  "iPhone XR":        {arm:["64GB","128GB","256GB"],            cor:["Preto","Branco","Azul","Coral","Amarelo","Vermelho"],              base: 1050},
  "iPhone XS":        {arm:["64GB","256GB","512GB"],            cor:["Cinza-espacial","Prata","Dourado"],                                base: 1150},
  "iPhone XS Max":    {arm:["64GB","256GB","512GB"],            cor:["Cinza-espacial","Prata","Dourado"],                                base: 1350},
  "iPhone 11":        {arm:["64GB","128GB","256GB"],            cor:["Preto","Branco","Verde","Amarelo","Roxo","Vermelho"],              base: 1500},
  "iPhone 11 Pro":    {arm:["64GB","256GB","512GB"],            cor:["Cinza-espacial","Prata","Dourado","Verde-meia-noite"],             base: 1750},
  "iPhone 11 Pro Max":{arm:["64GB","256GB","512GB"],            cor:["Cinza-espacial","Prata","Dourado","Verde-meia-noite"],             base: 2050},
  "iPhone 12 mini":   {arm:["64GB","128GB","256GB"],            cor:["Preto","Branco","Azul","Verde","Roxo","Vermelho"],                 base: 1650},
  "iPhone 12":        {arm:["64GB","128GB","256GB"],            cor:["Preto","Branco","Azul","Verde","Roxo","Vermelho"],                 base: 1950},
  "iPhone 12 Pro":    {arm:["128GB","256GB","512GB"],           cor:["Grafite","Prata","Dourado","Azul-pacífico"],                       base: 2300},
  "iPhone 12 Pro Max":{arm:["128GB","256GB","512GB"],           cor:["Grafite","Prata","Dourado","Azul-pacífico"],                       base: 2700},
  "iPhone 13 mini":   {arm:["128GB","256GB","512GB"],           cor:["Meia-noite","Estelar","Azul","Rosa","Verde","Vermelho"],           base: 2050},
  "iPhone 13":        {arm:["128GB","256GB","512GB"],           cor:["Meia-noite","Estelar","Azul","Rosa","Verde","Vermelho"],           base: 2400},
  "iPhone 13 Pro":    {arm:["128GB","256GB","512GB","1TB"],     cor:["Grafite","Prata","Dourado","Azul-sierra","Verde-alpino"],          base: 2900},
  "iPhone 13 Pro Max":{arm:["128GB","256GB","512GB","1TB"],     cor:["Grafite","Prata","Dourado","Azul-sierra","Verde-alpino"],          base: 3400},
  "iPhone 14":        {arm:["128GB","256GB","512GB"],           cor:["Meia-noite","Estelar","Azul","Roxo","Amarelo","Vermelho"],         base: 2850},
  "iPhone 14 Plus":   {arm:["128GB","256GB","512GB"],           cor:["Meia-noite","Estelar","Azul","Roxo","Amarelo","Vermelho"],         base: 3200},
  "iPhone 14 Pro":    {arm:["128GB","256GB","512GB","1TB"],     cor:["Preto-espacial","Prata","Dourado","Roxo-profundo"],                base: 3800},
  "iPhone 14 Pro Max":{arm:["128GB","256GB","512GB","1TB"],     cor:["Preto-espacial","Prata","Dourado","Roxo-profundo"],                base: 4400},
  "iPhone 15":        {arm:["128GB","256GB","512GB"],           cor:["Preto","Azul","Verde","Amarelo","Rosa"],                           base: 3600},
  "iPhone 15 Plus":   {arm:["128GB","256GB","512GB"],           cor:["Preto","Azul","Verde","Amarelo","Rosa"],                           base: 4100},
  "iPhone 15 Pro":    {arm:["128GB","256GB","512GB","1TB"],     cor:["Titânio Natural","Titânio Azul","Titânio Branco","Titânio Preto"], base: 4900},
  "iPhone 15 Pro Max":{arm:["256GB","512GB","1TB"],             cor:["Titânio Natural","Titânio Azul","Titânio Branco","Titânio Preto"], base: 5700},
  "iPhone 16":        {arm:["128GB","256GB","512GB"],           cor:["Ultramarino","Verde-acinzentado","Rosa","Branco","Preto"],         base: 4400},
  "iPhone 16 Plus":   {arm:["128GB","256GB","512GB"],           cor:["Ultramarino","Verde-acinzentado","Rosa","Branco","Preto"],         base: 4900},
  "iPhone 16 Pro":    {arm:["128GB","256GB","512GB","1TB"],     cor:["Titânio Deserto","Titânio Natural","Titânio Branco","Titânio Preto"], base: 5800},
  "iPhone 16 Pro Max":{arm:["256GB","512GB","1TB"],             cor:["Titânio Deserto","Titânio Natural","Titânio Branco","Titânio Preto"], base: 6800},
  /* Cores REAIS da linha 17 — ela não usa titânio como o 15 e o 16 Pro.
     O 17 Pro é Prata, Laranja-cósmico e Azul-profundo; o 17 tem Lavanda,
     Sálvia, Azul-névoa, Branco e Preto. */
  "iPhone 16e":       {arm:["128GB","256GB","512GB"],           cor:["Preto","Branco"],                                                  base: 3400},
  "iPhone 17":        {arm:["256GB","512GB"],                   cor:["Preto","Branco","Azul-névoa","Lavanda","Sálvia"],                  base: 5400},
  "iPhone 17e":       {arm:["128GB","256GB","512GB"],           cor:["Preto","Branco","Rosa-suave"],                                     base: 4200},
  /* o Air e uma linha propria: o mais fino da Apple, entre o 17 e o 17 Pro */
  "iPhone Air":       {arm:["256GB","512GB","1TB"],             cor:["Preto-espacial","Branco-nuvem","Dourado-claro","Azul-celeste"],    base: 6400},
  "iPhone 17 Pro":    {arm:["256GB","512GB","1TB"],             cor:["Prata","Laranja-cósmico","Azul-profundo"],                         base: 6900},
  "iPhone 17 Pro Max":{arm:["256GB","512GB","1TB","2TB"],       cor:["Prata","Laranja-cósmico","Azul-profundo"],                         base: 7900},
  "iPhone 18":        {arm:["256GB","512GB"],                   cor:["Preto","Branco","Azul","Verde"],                                   base: 6200},
  "iPhone 18 Pro":    {arm:["256GB","512GB","1TB"],             cor:["Titânio Natural","Titânio Preto","Titânio Prata"],                 base: 7800},
  "iPhone 18 Pro Max":{arm:["256GB","512GB","1TB","2TB"],       cor:["Titânio Natural","Titânio Preto","Titânio Prata"],                 base: 8900}
};

const COND = ["Novo (lacrado)","Seminovo","Vitrine","Usado"];

/* Avarias e quanto cada uma abate. É a régua da loja — pode mexer à vontade. */
const AVARIAS = [
  {k:"Tela riscada",            d: 120},
  {k:"Tela trincada",           d: 450},
  {k:"Vidro traseiro trincado", d: 280},
  {k:"Marcas de uso na lateral",d:  80},
  {k:"Câmera com risco",        d: 200},
  {k:"Face ID não funciona",    d: 400},
  {k:"Botão com defeito",       d: 150},
  {k:"Bateria trocada",         d: 180},
  {k:"Tela trocada (paralela)", d: 350},
  {k:"Sinal de oxidação",       d: 500}
];

const FATOR_COND = {"Novo (lacrado)":1.00,"Vitrine":0.90,"Seminovo":0.80,"Usado":0.66};

/* abaixo de 80% a Apple já considera a bateria desgastada */
function fatorBateria(b){
  if(b>=95) return 1.00;
  if(b>=90) return 0.97;
  if(b>=85) return 0.93;
  if(b>=80) return 0.88;
  return 0.80;
}

/* preço sugerido com cada desconto explicado — nada de número que cai do céu */
function precificar({modelo,cond,bateria,avarias}){
  const base = CATALOGO[modelo]?.base || 1000;
  const fc = FATOR_COND[cond] ?? 0.8;
  const fb = cond==="Novo (lacrado)" ? 1 : fatorBateria(bateria);
  const descAv = (avarias||[]).reduce((s,k)=>s+(AVARIAS.find(a=>a.k===k)?.d||0),0);
  const bruto = base*fc*fb;
  const linhas = [
    {r:`Referência do ${modelo}`, v:base},
    {r:`Condição: ${cond}`,       v:Math.round(base*fc-base), neg:fc<1}
  ];
  if(cond!=="Novo (lacrado)") linhas.push({r:`Bateria ${bateria}%`, v:Math.round(base*fc*fb-base*fc), neg:fb<1});
  (avarias||[]).forEach(k=>linhas.push({r:k, v:-(AVARIAS.find(a=>a.k===k)?.d||0), neg:true}));
  return {sugerido:Math.max(100,Math.round((bruto-descAv)/10)*10), linhas};
}

/* ============================================================
   APARELHOS — cada iPhone é uma peça única (IMEI, bateria, avarias)
   ============================================================ */
let proximoId = 1;
const APARELHOS = [];
Object.keys(CATALOGO).forEach(m=>{
  const info = CATALOGO[m];
  const qtd = _ent(0,3);
  for(let i=0;i<qtd;i++){
    const cond = _pick(COND);
    const lacrado = cond==="Novo (lacrado)";
    const bat = lacrado ? 100 : _ent(76,100);
    const avs = lacrado ? [] : (_rnd()>0.55 ? [_pick(AVARIAS).k] : []);
    const {sugerido} = precificar({modelo:m,cond,bateria:bat,avarias:avs});
    APARELHOS.push({
      id: proximoId++, modelo:m, arm:_pick(info.arm), cor:_pick(info.cor), cond,
      bateria:bat, avarias:avs,
      imei:`35${_ent(100000,999999)}${_ent(100000,999999)}`,
      custo:Math.round(sugerido*(0.68+_rnd()*0.12)),
      venda:sugerido,
      entrada:`${String(_ent(1,12)).padStart(2,"0")}/08/2026`,
      vendido:false,
      naVitrine:true            // desmarcado = fica só no seu estoque, cliente não vê
    });
  }
});

/* ============================================================
   OUTRAS LINHAS DA LOJA
   Cada categoria tem o seu jeito: Watch e MacBook são peça única com bateria,
   igual iPhone. Acessório e motinha são por quantidade — não faz sentido
   guardar "saúde da bateria" de uma película.
   ============================================================ */
/* Linha atual do Apple Watch (Series 11, SE 3 e Ultra 3). Cada modelo tem
   material e cores próprios — o alumínio e o titânio não compartilham cor. */
const CAT_WATCH = {
  "Apple Watch SE 3":       {var:["40mm","44mm"], cor:["Meia-noite","Estelar"],                                    base:2200},
  "Apple Watch Series 11":  {var:["42mm","46mm"], cor:["Preto-jato","Prata","Cinza-espacial","Ouro-rosé"],         base:3900},
  "Apple Watch Ultra 3":    {var:["49mm"],        cor:["Titânio Natural","Titânio Preto"],                         base:8900}
};
const CAT_MAC = {
  "MacBook Neo":          {var:["256GB","512GB","1TB"], cor:["Prata","Blush","Citrus","Índigo"],               base: 8499},
  "MacBook Air 13\" M3":  {var:["256GB","512GB","1TB"], cor:["Cinza-espacial","Estelar","Meia-noite","Prata"], base: 5900},
  "MacBook Air 15\" M3":  {var:["256GB","512GB","1TB"], cor:["Cinza-espacial","Estelar","Meia-noite","Prata"], base: 7200},
  "MacBook Pro 14\" M4":  {var:["512GB","1TB"],         cor:["Preto-espacial","Prata"],                        base:11500}
  /* iMac fora de propósito: a loja trabalha só com notebook, não com
     computador de mesa. As fotos dele saíram da pasta junto. */
};
const CAT_IPAD = {
  "iPad (11ª geração)": {var:["128GB","256GB","512GB"],      cor:["Prata","Azul","Rosa","Amarelo"],            base:2900},
  "iPad mini (A17 Pro)":{var:["128GB","256GB","512GB"],      cor:["Cinza-espacial","Estelar","Roxo","Azul"],   base:4200},
  "iPad Air 11\" M3":   {var:["128GB","256GB","512GB","1TB"],cor:["Cinza-espacial","Estelar","Roxo","Azul"],   base:5300},
  "iPad Air 13\" M3":   {var:["128GB","256GB","512GB","1TB"],cor:["Cinza-espacial","Estelar","Roxo","Azul"],   base:7100},
  "iPad Pro 11\" M4":   {var:["256GB","512GB","1TB","2TB"],  cor:["Preto-espacial","Prata"],                   base:9200},
  "iPad Pro 13\" M4":   {var:["256GB","512GB","1TB","2TB"],  cor:["Preto-espacial","Prata"],                   base:12400}
};
const CAT_MOTO = {
  "Motinha Elétrica Kids 6V":   {var:["Única"], cor:["Vermelho","Preto","Rosa","Azul"],  base: 750},
  "Motinha Elétrica Kids 12V":  {var:["Única"], cor:["Vermelho","Preto","Rosa","Azul"],  base:1250},
  "Triciclo Elétrico Infantil": {var:["Única"], cor:["Vermelho","Preto","Azul"],         base: 980},
  "Scooter Elétrica 350W":      {var:["Única"], cor:["Preto","Branco"],                  base:2100},
  "Scooter Elétrica 800W":      {var:["Única"], cor:["Preto","Branco"],                  base:3400}
};
const CAT_ACES = {
  "AirPods 4":                {var:["Única"],             cor:["Branco"],                 base: 950},
  "AirPods Pro 2":            {var:["Única"],             cor:["Branco"],                 base:1450},
  "Carregador MagSafe":       {var:["Única"],             cor:["Branco"],                 base: 240},
  "Fonte Turbo 20W USB-C":    {var:["Única"],             cor:["Branco"],                 base:  90},
  "Cabo USB-C 2m":            {var:["Única"],             cor:["Branco"],                 base:  70},
  "Capa Silicone MagSafe":    {var:["Única"],             cor:["Preto","Azul","Rosa"],    base: 120},
  "Película 3D Cerâmica":     {var:["Única"],             cor:["Preto"],                  base:  45},
  "AirTag (rastreador)":      {var:["1 unidade","4 unidades"], cor:["Branco"],            base: 280},
  "JBL Go 4":                 {var:["Única"],             cor:["Preto","Azul","Vermelho"],base: 320},
  "JBL PartyBox 100":         {var:["Única"],             cor:["Preto"],                  base:2190},
  "Power Bank 10.000mAh":     {var:["Única"],             cor:["Preto","Branco"],         base: 160}
};

/* peça única, com bateria — mesmo modelo do iPhone */
function _gerarPecas(catalogo, categoria, condicoes){
  const out = [];
  Object.keys(catalogo).forEach(m=>{
    const info = catalogo[m];
    for(let i=0;i<_ent(0,2);i++){
      const cond = _pick(condicoes);
      const lacrado = cond==="Novo (lacrado)";
      const bat = lacrado ? 100 : _ent(80,100);
      const fb = lacrado ? 1 : fatorBateria(bat);
      const preco = Math.round(info.base*(FATOR_COND[cond]??.8)*fb/10)*10;
      out.push({
        id: proximoId++, categoria, modelo:m, arm:_pick(info.var), cor:_pick(info.cor),
        cond, bateria:bat, avarias:[], imei:"",
        custo:Math.round(preco*(0.68+_rnd()*0.12)), venda:preco,
        entrada:`${String(_ent(1,12)).padStart(2,"0")}/08/2026`, vendido:false, naVitrine:true
      });
    }
  });
  return out;
}
/* por quantidade — sem bateria e sem IMEI */
function _gerarQuantidade(catalogo, categoria){
  const out = [];
  Object.keys(catalogo).forEach(m=>{
    const info = catalogo[m];
    out.push({
      id: proximoId++, categoria, modelo:m, arm:info.var[0], cor:info.cor[0],
      cond:"Novo (lacrado)", bateria:null, avarias:[], imei:"",
      qtd:_ent(0,14), custo:Math.round(info.base*0.62), venda:info.base,
      entrada:"01/08/2026", vendido:false, naVitrine:true, porQuantidade:true
    });
  });
  return out;
}

const WATCHES     = _gerarPecas(CAT_WATCH, "Apple Watch", COND);
const IPADS       = _gerarPecas(CAT_IPAD,  "iPad",        ["Novo (lacrado)","Seminovo","Vitrine"]);
const MACBOOKS    = _gerarPecas(CAT_MAC,   "MacBook",     ["Novo (lacrado)","Seminovo","Vitrine"]);
const MOTOS       = _gerarQuantidade(CAT_MOTO, "Motos elétricas");
const ACESSORIOS  = _gerarQuantidade(CAT_ACES, "Acessórios");

/* marca a categoria dos iPhones, que foram gerados antes das outras */
APARELHOS.forEach(a => a.categoria = "iPhone");

/* tudo o que a loja vende, numa lista só */
const PRODUTOS = [...APARELHOS, ...IPADS, ...WATCHES, ...MACBOOKS, ...MOTOS, ...ACESSORIOS];

/* as seções do catálogo, na ordem em que aparecem para o cliente */
const CATEGORIAS = [
  {nome:"iPhone",          titulo:"iPhone",           sub:"Lacrados e seminovos, do 7 ao 18 Pro Max — mais o Air e a linha e.", catalogo:CATALOGO,  campoVar:"arm"},
  {nome:"iPad",            titulo:"iPad",             sub:"iPad, mini, Air e Pro para estudo, trabalho e desenho.", catalogo:CAT_IPAD,  campoVar:"var"},
  {nome:"Apple Watch",     titulo:"Apple Watch",      sub:"SE, Series e Ultra, com pulseira à sua escolha.",        catalogo:CAT_WATCH, campoVar:"var"},
  {nome:"MacBook",         titulo:"MacBook",          sub:"Air e Pro com configurações para estudo e trabalho.",    catalogo:CAT_MAC,   campoVar:"var"},
  {nome:"Acessórios",      titulo:"Acessórios",       sub:"AirPods, carregadores, capas, caixas de som e mais.",    catalogo:CAT_ACES,  campoVar:"var"},
  {nome:"Motos elétricas", titulo:"Motos elétricas",  sub:"Motinhas e scooters elétricas para as crianças.",        catalogo:CAT_MOTO,  campoVar:"var"}
];
/* opções (memória/tamanho) e cores de qualquer produto, seja de que linha for */
function opcoesDe(p){
  const c = (CATEGORIAS.find(x=>x.nome===p.categoria)||{}).catalogo || {};
  const info = c[p.modelo] || {};
  return {vars: info.arm || info.var || [p.arm], cores: info.cor || [p.cor]};
}

/* ============================================================
   PREÇOS QUE VOCÊ AJUSTA
   ============================================================ */
const _CHAVE_PRECOS  = "gemeos-precos";
const _CHAVE_VITRINE = "gemeos-vitrine";

function _ler(chave){
  try{ return JSON.parse(localStorage.getItem(chave) || "{}"); }catch(e){ return {}; }
}
function _gravar(chave, obj){
  try{ localStorage.setItem(chave, JSON.stringify(obj)); return true; }catch(e){ return false; }
}

/** Preço que vale hoje: o seu, se você definiu; senão o calculado. */
function precoDe(ap){
  const p = _ler(_CHAVE_PRECOS)[ap.id];
  return (typeof p === "number" && p > 0) ? p : ap.venda;
}
/** Define o preço de venda. Passar null volta para a sugestão do sistema. */
function definirPreco(id, valor){
  const m = _ler(_CHAVE_PRECOS);
  if(valor === null || valor === undefined || valor === "") delete m[id];
  else m[id] = Number(valor);
  return _gravar(_CHAVE_PRECOS, m);
}
/** True se esse aparelho está com preço definido por você (e não pelo cálculo). */
function precoManual(id){ return typeof _ler(_CHAVE_PRECOS)[id] === "number"; }

/** Aparece na vitrine do cliente? */
function naVitrine(ap){
  const v = _ler(_CHAVE_VITRINE)[ap.id];
  return v === undefined ? ap.naVitrine : !!v;
}
function definirVitrine(id, mostrar){
  const m = _ler(_CHAVE_VITRINE);
  m[id] = !!mostrar;
  return _gravar(_CHAVE_VITRINE, m);
}

/* o que o CLIENTE pode ver: em estoque e liberado para a vitrine.
   Produto por quantidade só aparece se ainda houver peça. */
function paraVitrine(categoria){
  return PRODUTOS.filter(p =>
    !p.vendido && naVitrine(p) &&
    (!p.porQuantidade || p.qtd > 0) &&
    (!categoria || p.categoria === categoria));
}

/* nome de arquivo previsível da foto:
   "iPhone 15 Pro" + "Titânio Natural" -> fotos/iphone-15-pro-titanio-natural.jpg
   Sem acento e sem espaço, para funcionar em qualquer servidor. */
function semAcento(s){
  // ̀-ͯ = a faixa dos acentos que o NFD separa da letra. Escrito em
  // código, e não com os caracteres soltos, porque acento solto num arquivo
  // salvo em outra codificação vira lixo e a função pararia de limpar nada.
  return s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase()
          .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
/* ============================================================
   FOTOS DOS PRODUTOS
   ============================================================
   As fotos vieram do material de redes sociais da própria loja (o PDF do
   Behance), extraídas das imagens ORIGINAIS embutidas — não de captura de
   tela, que sai borrada.

   REGRA QUE NÃO SE QUEBRA: cada foto só é usada no produto que ela realmente
   mostra. Nada de pôr foto de iPhone 11 num anúncio de iPhone 15 só para
   preencher — a loja vende confiança e o cliente percebe. Modelo sem foto
   mostra o contorno desenhado, que é honesto.

   Para COMPLETAR: fotografe o aparelho e salve em fotos/ com o nome do modelo
   sem acento e com hífen (ex.: fotos/iphone-15-pro.jpg). Aparece sozinho.
   Para uma cor específica: fotos/iphone-15-pro-titanio-azul.jpg
   ============================================================ */
const FOTOS = {
  /* iPhone 11 — as seis cores, recortadas uma a uma do anúncio da loja.
     É o que faz o clique na bolinha trocar a foto de verdade. */
  /* DESATIVADOS a pedido do dono: eram recortes de baixa resolução, com
     pedaço de outro aparelho no quadro. Ficavam piores que não ter foto —
     sem foto, o card mostra o contorno desenhado, que é limpo. Os arquivos
     seguem na pasta; para voltar, basta tirar o comentário.
  "iPhone 11|Preto":     "fotos/iphone-11-preto.jpg",
  "iPhone 11|Branco":    "fotos/iphone-11-branco.jpg",
  "iPhone 11|Verde":     "fotos/iphone-11-verde.jpg",
  "iPhone 11|Amarelo":   "fotos/iphone-11-amarelo.jpg",
  "iPhone 11|Roxo":      "fotos/iphone-11-roxo.jpg",
  "iPhone 11|Vermelho":  "fotos/iphone-11-vermelho.jpg",
  */

  /* Fotos OFICIAIS da Apple, aparelho sozinho e fundo transparente,
     baixadas por baixar_fotos_apple.py. Uma por modelo e por cor — é o que
     faz o clique na bolinha trocar a foto nos modelos novos. */
  /* A linha 17 resolve sozinha pelo nome do arquivo (fotos-disponiveis.js),
     entao nao precisa de entrada manual aqui. Ficam so as excecoes. */

  /* também desativados pelo mesmo motivo — baixa resolução e enquadramento ruim
  "iPhone 12 Pro Max|Azul-pacífico": "fotos/iphone-12-pro-max-azul-pacifico.jpg",
  "iPhone 12|Roxo":                  "fotos/iphone-12-roxo.jpg",
  "iPhone 11 Pro":                   "fotos/iphone-11-pro-cores.jpg",
  "iPhone 11 Pro Max":               "fotos/iphone-11-pro-cores.jpg",
  "iPhone 12":                       "fotos/iphone-12-cores.jpg",
  "iPhone 12 mini":                  "fotos/iphone-12-cores.jpg",
  */

  /* acessórios */
  "iPad 10ª geração":                "fotos/ipad-pro.jpg",
  "iPad Pro M4":                     "fotos/ipad-pro.jpg",
  "AirTag (rastreador)":             "fotos/airtag.jpg",
  "JBL PartyBox 100":                "fotos/jbl-partybox-100.jpg",
  "Redmi Note 13":                   "fotos/redmi-note-13.jpg"
};

/** Foto do produto, na ordem: mapa explícito (modelo+cor), mapa por modelo,
 *  e por fim o arquivo por convenção de nome — desde que ele realmente exista
 *  (conferido em FOTOS_EXISTENTES, gerado por gerar_lista_fotos.py).
 *  Devolve null quando não há foto, e aí a tela desenha o contorno. */
function fotoDe(modelo, cor){
  const direto = FOTOS[`${modelo}|${cor}`] || FOTOS[modelo];
  if(direto) return direto;
  if(typeof FOTOS_EXISTENTES !== "undefined"){
    for(const caminho of fotosPorNome(modelo, cor)){
      if(FOTOS_EXISTENTES.has(caminho.replace("fotos/",""))) return caminho;
    }
  }
  return null;
}
/** Caminhos por convenção de nome, na ordem em que devem ser tentados.
 *  .png primeiro porque é o formato das fotos oficiais com fundo transparente
 *  (baixar_fotos_apple.py); .jpg cobre as fotos tiradas na loja.
 *  Serve para acrescentar foto nova sem mexer em código: basta salvar o
 *  arquivo em fotos/ com o nome certo. */
function fotosPorNome(modelo, cor){
  const m = semAcento(modelo);
  const lista = [];
  /* .webp primeiro: mesma imagem, mesma transparência, cerca de 10x menor.
     No celular, na rede da rua, é a diferença entre a loja abrir rápido e o
     cliente desistir. O .png/.jpg fica como reserva para foto acrescentada
     à mão que ainda não passou pelo otimizar_fotos.py. */
  if(cor){
    const c = semAcento(cor);
    lista.push(`fotos/${m}-${c}.webp`, `fotos/${m}-${c}.png`, `fotos/${m}-${c}.jpg`);
  }
  lista.push(`fotos/${m}.webp`, `fotos/${m}.png`, `fotos/${m}.jpg`);
  return lista;
}
