/* ============================================================
   ESTOQUE — agora vindo do banco de dados real (Supabase)
   ============================================================
   Antes, este arquivo INVENTAVA os aparelhos. Agora ele busca os produtos
   de verdade no mesmo banco que o Milton (a IA do WhatsApp) já usa. Ou
   seja, cadastrou um produto uma vez, aparece nos dois lugares — não tem
   mais "site" e "estoque do WhatsApp" separados.

   Só a VITRINE (vitrine.html) usa este arquivo diretamente pra desenhar a
   tela; index.html também carrega ele pra ler o mesmo PRODUTOS (ver
   carregarEstoqueIndex() no index.html).

   COMO FUNCIONA
   PRODUTOS e CATEGORIAS começam vazios. `carregarEstoque()` busca no
   Supabase e preenche os dois. `ESTOQUE_CARREGADO` é a promessa que
   vitrine.html/index.html esperam antes de desenhar a tela — assim ela
   nunca aparece pela metade.

   Se a internet cair ou o Supabase estiver fora do ar, a tela mostra
   "nenhum produto encontrado" em vez de travar — o erro fica só no
   console (F12), pra não assustar o cliente.
   ============================================================ */

const SUPABASE_URL = "https://bzeceniidapsjvaudwwb.supabase.co";
/* Chave pública (anon): só enxerga produtos com status "disponivel" — regra
   configurada no próprio banco (RLS), não aqui. Não dá para usar essa chave
   pra cadastrar ou apagar produto, só pra ler. Por isso ela pode ficar
   exposta no código do site sem risco. */
const SUPABASE_ANON_KEY = "sb_publishable_57Nhaiq5oNiuCd5MezKpxw_gn80rCja";

async function _supabaseGet(caminho) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${caminho}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  if (!r.ok) throw new Error(`Supabase respondeu ${r.status} em ${caminho}`);
  return r.json();
}

/* ---------- de "condicao" do banco para o texto que o site já usava ---------- */
const COND = ["Novo (lacrado)", "Seminovo", "Vitrine", "Usado"];
function condicaoDe(c) {
  switch (c) {
    case "nova": return "Novo (lacrado)";
    case "seminova":
    case "seminovo": return "Seminovo";
    case "usada": return "Usado";
    case "vitrine": return "Vitrine";
    default: return "Seminovo";
  }
}

/* ---------- de (tipo + categoria) do banco para a seção da vitrine ----------
   O banco só distingue 4 tipos (iphone/xiaomi/moto_eletrica/acessorio) —
   iPad, Apple Watch, MacBook e "Games e internet" são todos cadastrados como
   "acessorio", diferenciados pelo campo `categoria` de `modelos`. Convenção
   pra cadastrar um produto novo nessas seções: categoria = "tablet" (iPad),
   "smartwatch" (Apple Watch), "smartwatch_gps" (relógio esportivo de outra
   marca, ex. Garmin — NÃO é Apple Watch), "notebook" (MacBook), "console"
   (Games e internet). Qualquer outra coisa cai em "Acessórios". */
function categoriaDe(m) {
  if (m.tipo === "iphone") return "iPhone";
  if (m.tipo === "xiaomi") return "Xiaomi";
  if (m.tipo === "moto_eletrica") return "Motos elétricas";
  const sub = (m.categoria || "").toLowerCase();
  if (sub === "tablet") return "iPad";
  if (sub === "smartwatch") return "Apple Watch";
  if (sub === "smartwatch_gps") return "Relógios esportivos";
  if (sub === "notebook") return "MacBook";
  if (sub === "console") return "Games e internet";
  return "Acessórios";
}

/* peça única (tem bateria/IMEI, cada unidade é uma peça) vs. por quantidade
   (acessório, moto elétrica — não tem bateria nem IMEI) */
function porQuantidadeDe(categoria) {
  return categoria === "Motos elétricas" || categoria === "Acessórios" || categoria === "Games e internet";
}

/* nome que aparece no card. "iPhone XR" já vem pronto do banco pra linha
   Apple; só prefixa a marca quando não for Apple (ex.: "Xiaomi Redmi Note 13") */
function nomeModelo(m) {
  const base = m.versao ? `${m.modelo} ${m.versao}` : m.modelo;
  return m.marca && m.marca !== "Apple" ? `${m.marca} ${base}` : base;
}

/* ============================================================
   AS SEÇÕES DA VITRINE, na ordem em que aparecem para o cliente.
   Seção sem nenhum produto simplesmente não aparece (ver vitrine.html,
   pinta()) — não precisa tirar daqui uma categoria que ainda não tem nada
   cadastrado no banco.
   ============================================================ */
const CATEGORIAS = [
  { nome: "iPhone", titulo: "iPhone", sub: "Lacrados e seminovos, do 7 ao 18 Pro Max — mais o Air e a linha e." },
  { nome: "Xiaomi", titulo: "Xiaomi", sub: "Android com ótimo custo-benefício, lacrado e seminovo." },
  { nome: "iPad", titulo: "iPad", sub: "iPad, mini, Air e Pro para estudo, trabalho e desenho." },
  { nome: "Apple Watch", titulo: "Apple Watch", sub: "SE, Series e Ultra, com pulseira à sua escolha." },
  { nome: "Relógios esportivos", titulo: "Relógios esportivos", sub: "Relógios GPS de outras marcas, como Garmin, para treino e corrida." },
  { nome: "MacBook", titulo: "MacBook", sub: "Air e Pro com configurações para estudo e trabalho." },
  { nome: "Games e internet", titulo: "Games e internet", sub: "PlayStation, Xbox, controles e kits Starlink." },
  { nome: "Acessórios", titulo: "Acessórios", sub: "AirPods, carregadores, capas, caixas de som e mais." },
  { nome: "Motos elétricas", titulo: "Motos elétricas", sub: "Motinhas e scooters elétricas para as crianças." }
];

/* ============================================================
   PRODUTOS — começa vazio, carregarEstoque() preenche.
   ============================================================ */
const PRODUTOS = [];

async function carregarEstoque() {
  const [modelos, produtos] = await Promise.all([
    _supabaseGet("modelos?select=id,tipo,marca,modelo,versao,categoria,ficha_tecnica"),
    _supabaseGet(
      "produtos?select=id,modelo_id,cor,armazenamento,condicao,quantidade,preco,custo_aquisicao,observacao,data_entrada,status,imei,bateria,avarias,selos,na_vitrine&status=eq.disponivel"
    )
  ]);
  const modeloPorId = {};
  modelos.forEach(m => { modeloPorId[m.id] = m; });

  produtos.forEach(p => {
    const m = modeloPorId[p.modelo_id];
    if (!m) return; // não deveria acontecer (o banco garante o vínculo), mas não trava a tela se acontecer
    const categoria = categoriaDe(m);
    const porQuantidade = porQuantidadeDe(categoria);
    PRODUTOS.push({
      id: p.id,
      modeloId: p.modelo_id,
      modelo: nomeModelo(m),
      fichaTecnica: m.ficha_tecnica || "",
      categoria,
      arm: p.armazenamento || "",
      cor: p.cor || "",
      cond: condicaoDe(p.condicao),
      bateria: p.bateria,
      avarias: p.avarias || [],
      selos: p.selos || [],
      imei: p.imei || "",
      custo: Number(p.custo_aquisicao) || 0,
      venda: Number(p.preco),
      entrada: p.data_entrada || "",
      observacao: p.observacao || "",
      vendido: p.status !== "disponivel",
      naVitrine: p.na_vitrine !== false,
      porQuantidade,
      qtd: porQuantidade ? p.quantidade : undefined
    });
  });
}

/* a vitrine.html/index.html esperam essa promessa antes de desenhar a tela */
const ESTOQUE_CARREGADO = carregarEstoque().catch(err => {
  console.error("Não consegui carregar o estoque do Supabase:", err);
});

/* ============================================================
   PREÇO E VISIBILIDADE — agora vêm direto do banco (preco, na_vitrine),
   não tem mais ajuste guardado só no navegador.
   ============================================================ */
function precoDe(p) { return p.venda; }
function naVitrine(p) { return !!p.naVitrine; }

/* o que o CLIENTE pode ver: em estoque, liberado pra vitrine, e — se for
   por quantidade — com pelo menos 1 unidade */
function paraVitrine(categoria) {
  return PRODUTOS.filter(p =>
    !p.vendido && naVitrine(p) &&
    (!p.porQuantidade || p.qtd > 0) &&
    (!categoria || p.categoria === categoria));
}

/* ============================================================
   CORES E ARMAZENAMENTO OFICIAIS de cada iPhone — só pra MOSTRAR as
   opções no card (a linha de bolinhas de cor e os botões de GB). Preço,
   condição, bateria e disponibilidade continuam vindo do banco real —
   isso aqui é só pra não perder a "prateleira completa" que a loja
   realmente tinha nesses lançamentos, mesmo quando hoje só existe UMA
   unidade física cadastrada. Se o cliente clicar numa cor que não é a
   unidade real, o botão "Consultar disponibilidade" já pergunta pro time
   se tem nessa configuração — é pra isso que aquele texto existe. */
const CORES_OFICIAIS_IPHONE = {
  "iPhone 7":         {arm:["32GB","128GB","256GB"],            cor:["Preto","Prata","Dourado","Rosé","Vermelho"]},
  "iPhone 7 Plus":    {arm:["32GB","128GB","256GB"],            cor:["Preto","Prata","Dourado","Rosé","Vermelho"]},
  "iPhone 8":         {arm:["64GB","128GB","256GB"],            cor:["Cinza-espacial","Prata","Dourado","Vermelho"]},
  "iPhone 8 Plus":    {arm:["64GB","128GB","256GB"],            cor:["Cinza-espacial","Prata","Dourado","Vermelho"]},
  "iPhone X":         {arm:["64GB","256GB"],                    cor:["Cinza-espacial","Prata"]},
  "iPhone XR":        {arm:["64GB","128GB","256GB"],            cor:["Preto","Branco","Azul","Coral","Amarelo","Vermelho"]},
  "iPhone XS":        {arm:["64GB","256GB","512GB"],            cor:["Cinza-espacial","Prata","Dourado"]},
  "iPhone XS Max":    {arm:["64GB","256GB","512GB"],            cor:["Cinza-espacial","Prata","Dourado"]},
  "iPhone 11":        {arm:["64GB","128GB","256GB"],            cor:["Preto","Branco","Verde","Amarelo","Roxo","Vermelho"]},
  "iPhone 11 Pro":    {arm:["64GB","256GB","512GB"],            cor:["Cinza-espacial","Prata","Dourado","Verde-meia-noite"]},
  "iPhone 11 Pro Max":{arm:["64GB","256GB","512GB"],            cor:["Cinza-espacial","Prata","Dourado","Verde-meia-noite"]},
  "iPhone 12 mini":   {arm:["64GB","128GB","256GB"],            cor:["Preto","Branco","Azul","Verde","Roxo","Vermelho"]},
  "iPhone 12":        {arm:["64GB","128GB","256GB"],            cor:["Preto","Branco","Azul","Verde","Roxo","Vermelho"]},
  "iPhone 12 Pro":    {arm:["128GB","256GB","512GB"],           cor:["Grafite","Prata","Dourado","Azul-pacífico","Verde"]},
  "iPhone 12 Pro Max":{arm:["128GB","256GB","512GB"],           cor:["Grafite","Prata","Dourado","Azul-pacífico"]},
  "iPhone 13 mini":   {arm:["128GB","256GB","512GB"],           cor:["Meia-noite","Estelar","Azul","Rosa","Verde","Vermelho"]},
  "iPhone 13":        {arm:["128GB","256GB","512GB"],           cor:["Meia-noite","Estelar","Azul","Rosa","Verde","Vermelho"]},
  "iPhone 13 Pro":    {arm:["128GB","256GB","512GB","1TB"],     cor:["Grafite","Prata","Dourado","Azul-sierra","Verde-alpino"]},
  "iPhone 13 Pro Max":{arm:["128GB","256GB","512GB","1TB"],     cor:["Grafite","Prata","Dourado","Azul-sierra","Verde-alpino"]},
  "iPhone 14":        {arm:["128GB","256GB","512GB"],           cor:["Meia-noite","Estelar","Azul","Roxo","Amarelo","Vermelho"]},
  "iPhone 14 Plus":   {arm:["128GB","256GB","512GB"],           cor:["Meia-noite","Estelar","Azul","Roxo","Amarelo","Vermelho"]},
  "iPhone 14 Pro":    {arm:["128GB","256GB","512GB","1TB"],     cor:["Preto-espacial","Prata","Dourado","Roxo-profundo"]},
  "iPhone 14 Pro Max":{arm:["128GB","256GB","512GB","1TB"],     cor:["Preto-espacial","Prata","Dourado","Roxo-profundo","Verde"]},
  "iPhone 15":        {arm:["128GB","256GB","512GB"],           cor:["Preto","Azul","Verde","Amarelo","Rosa"]},
  "iPhone 15 Plus":   {arm:["128GB","256GB","512GB"],           cor:["Preto","Azul","Verde","Amarelo","Rosa"]},
  "iPhone 15 Pro":    {arm:["128GB","256GB","512GB","1TB"],     cor:["Titânio Natural","Titânio Azul","Titânio Branco","Titânio Preto"]},
  "iPhone 15 Pro Max":{arm:["256GB","512GB","1TB"],             cor:["Titânio Natural","Titânio Azul","Titânio Branco","Titânio Preto"]},
  "iPhone 16":        {arm:["128GB","256GB","512GB"],           cor:["Ultramarino","Verde-acinzentado","Rosa","Branco","Preto"]},
  "iPhone 16 Plus":   {arm:["128GB","256GB","512GB"],           cor:["Ultramarino","Verde-acinzentado","Rosa","Branco","Preto"]},
  "iPhone 16 Pro":    {arm:["128GB","256GB","512GB","1TB"],     cor:["Titânio Deserto","Titânio Natural","Titânio Branco","Titânio Preto"]},
  "iPhone 16 Pro Max":{arm:["256GB","512GB","1TB"],             cor:["Titânio Deserto","Titânio Natural","Titânio Branco","Titânio Preto"]},
  "iPhone 16e":       {arm:["128GB","256GB","512GB"],           cor:["Preto","Branco"]},
  "iPhone 17":        {arm:["256GB","512GB"],                   cor:["Preto","Branco","Azul-névoa","Lavanda","Sálvia"]},
  "iPhone 17e":       {arm:["128GB","256GB","512GB"],           cor:["Preto","Branco","Rosa-suave"]},
  "iPhone Air":       {arm:["256GB","512GB","1TB"],             cor:["Preto-espacial","Branco-nuvem","Dourado-claro","Azul-celeste"]},
  "iPhone 17 Pro":    {arm:["256GB","512GB","1TB"],             cor:["Prata","Laranja-cósmico","Azul-profundo"]},
  "iPhone 17 Pro Max":{arm:["256GB","512GB","1TB","2TB"],       cor:["Prata","Laranja-cósmico","Azul-profundo"]},
  "iPhone 18":        {arm:["256GB","512GB"],                   cor:["Preto","Branco","Azul","Verde"]},
  "iPhone 18 Pro":    {arm:["256GB","512GB","1TB"],             cor:["Titânio Natural","Titânio Preto","Titânio Prata"]},
  "iPhone 18 Pro Max":{arm:["256GB","512GB","1TB","2TB"],       cor:["Titânio Natural","Titânio Preto","Titânio Prata"]}
};

/* opções (memória e cor) que aparecem no card. Pro iPhone, usa a lista
   oficial acima (a "prateleira completa" do modelo). Pras outras
   categorias (sem tabela oficial cadastrada), usa o que existir de
   verdade entre as outras unidades reais em estoque. */
function opcoesDe(p) {
  const oficial = CORES_OFICIAIS_IPHONE[p.modelo];
  if (oficial) {
    /* só entra no seletor a cor que tem foto de verdade (da loja ou oficial
       da Apple) — cor sem foto nenhuma não aparece mais como opção. Se por
       acaso NENHUMA cor tiver foto ainda, cai de volta pra lista oficial
       inteira, pra nunca deixar o seletor vazio. */
    const temFotoDaCor = c => !!(
      (typeof fotoManual === "function" && fotoManual(chaveFotoLoja(p.modelo, c))) ||
      (typeof fotoDe === "function" && fotoDe(p.modelo, c))
    );
    const coresComFoto = oficial.cor.filter(temFotoDaCor);
    return {
      vars: oficial.arm.length ? oficial.arm : (p.arm ? [p.arm] : ["Única"]),
      cores: coresComFoto.length ? coresComFoto : (oficial.cor.length ? oficial.cor : (p.cor ? [p.cor] : []))
    };
  }
  const irmaos = PRODUTOS.filter(x => x.modeloId === p.modeloId && !x.vendido);
  const vars = [...new Set(irmaos.map(x => x.arm).filter(Boolean))];
  const cores = [...new Set(irmaos.map(x => x.cor).filter(Boolean))];
  return {
    vars: vars.length ? vars : (p.arm ? [p.arm] : ["Única"]),
    cores: cores.length ? cores : (p.cor ? [p.cor] : [])
  };
}

/* ============================================================
   FOTO TIRADA NA LOJA
   ============================================================
   Sem mudança nesta etapa: a foto continua guardada no navegador desta
   máquina (localStorage) — ver foto-produto.js.
   ============================================================ */

/* nome de arquivo previsível da foto:
   "iPhone 15 Pro" + "Titânio Natural" -> fotos/iphone-15-pro-titanio-natural.jpg
   Sem acento e sem espaço, para funcionar em qualquer servidor. */
function semAcento(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
/* ============================================================
   FOTOS DOS PRODUTOS
   ============================================================ */
const FOTOS = {
  "iPad 10ª geração":                "fotos/ipad-pro.jpg",
  "iPad Pro M4":                     "fotos/ipad-pro.jpg",
  "AirTag (rastreador)":             "fotos/airtag.jpg",
  "JBL PartyBox 100":                "fotos/jbl-partybox-100.jpg",
  "Redmi Note 13":                   "fotos/redmi-note-13.jpg"
};

/* o cadastro real guarda a cor como "Azul (Blue)", "Preto (Black)" etc. —
   bom pro cliente ler, ruim pro nome de arquivo (o download oficial salvou
   só "azul", "preto"). Tira o "(Blue)" antes de procurar a foto; o texto
   exibido na tela não muda, só a busca do arquivo. */
function corSemTraducao(cor) {
  return (cor || "").replace(/\s*\([^)]*\)\s*$/, "").trim();
}

/* chave da FOTO TIRADA NA LOJA (a que o admin sobe pelo painel): por
   modelo+cor, não por peça física. Assim toda unidade Dourado do mesmo
   modelo usa a mesma foto — e a cor aparece com foto mesmo quando não tem
   nenhuma peça real daquela cor em estoque (a tal "prateleira completa"). */
function chaveFotoLoja(modelo, cor) {
  const m = semAcento(modelo);
  const c = semAcento(corSemTraducao(cor));
  return c ? `${m}-${c}` : m;
}

/** Foto do produto, na ordem: mapa explícito (modelo+cor), mapa por modelo,
 *  e por fim o arquivo por convenção de nome — desde que ele realmente exista
 *  (conferido em FOTOS_EXISTENTES, gerado por gerar_lista_fotos.py).
 *  Devolve null quando não há foto, e aí a tela desenha o contorno. */
function fotoDe(modelo, cor) {
  const direto = FOTOS[`${modelo}|${cor}`] || FOTOS[modelo];
  if (direto) return direto;
  if (typeof FOTOS_EXISTENTES !== "undefined") {
    for (const caminho of fotosPorNome(modelo, cor)) {
      if (FOTOS_EXISTENTES.has(caminho.replace("fotos/", ""))) return caminho;
    }
  }
  return null;
}
function fotosPorNome(modelo, cor) {
  const m = semAcento(modelo);
  const lista = [];
  const corBase = corSemTraducao(cor);
  if (corBase) {
    const c = semAcento(corBase);
    lista.push(`fotos/${m}-${c}.webp`, `fotos/${m}-${c}.png`, `fotos/${m}-${c}.jpg`);
  }
  lista.push(`fotos/${m}.webp`, `fotos/${m}.png`, `fotos/${m}.jpg`);
  return lista;
}
