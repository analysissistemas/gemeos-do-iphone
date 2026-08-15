/* ============================================================
   CORES REAIS DOS IPHONES
   O hex aproximado de cada cor oficial da Apple, para a bolinha do catálogo
   mostrar a cor de verdade em vez de um cinza genérico.

   `borda:true` marca as cores claras demais para aparecer sozinhas sobre fundo
   branco (Branco, Estelar, Prata…) — elas ganham um contorno, senão a bolinha
   some no card.

   Se a Apple lançar uma cor nova, é só acrescentar aqui. Nome exatamente igual
   ao usado no catálogo, senão a bolinha cai no cinza padrão.
   ============================================================ */
const CORES_APPLE = {
  // linha antiga
  "Preto":                {hex:"#1f2020"},
  "Branco":               {hex:"#f7f5f0", borda:true},
  "Prata":                {hex:"#eff1f2", borda:true},
  "Dourado":              {hex:"#f4e2ca", borda:true},
  "Rosé":                 {hex:"#eccfc4", borda:true},
  "Vermelho":             {hex:"#b60d2c"},   // (PRODUCT)RED
  "Cinza-espacial":       {hex:"#4f5357"},
  "Coral":                {hex:"#f2836b"},
  "Amarelo":              {hex:"#e9d97c"},
  "Azul":                 {hex:"#a8c6de"},
  "Verde":                {hex:"#c3d7c0"},
  "Roxo":                 {hex:"#b8afd3"},
  "Grafite":              {hex:"#55524e"},
  "Verde-meia-noite":     {hex:"#4a5049"},
  "Azul-pacífico":        {hex:"#2f4152"},

  // linha 13 a 15
  "Meia-noite":           {hex:"#232a31"},
  "Estelar":              {hex:"#f7ede4", borda:true},
  "Rosa":                 {hex:"#eed3d8", borda:true},
  "Azul-sierra":          {hex:"#a8c1d8"},
  "Verde-alpino":         {hex:"#576856"},
  "Preto-espacial":       {hex:"#403e3d"},
  "Roxo-profundo":        {hex:"#4d4550"},

  // titânio (15 Pro em diante)
  "Titânio Natural":      {hex:"#c0bcb6"},
  "Titânio Azul":         {hex:"#4e5c6b"},
  "Titânio Branco":       {hex:"#f1f0ec", borda:true},
  "Titânio Preto":        {hex:"#3b3b3d"},
  "Titânio Deserto":      {hex:"#bda58e"},
  "Titânio Prata":        {hex:"#e6e6e4", borda:true},

  // 16 em diante
  "Ultramarino":          {hex:"#a7b8e0"},
  "Verde-acinzentado":    {hex:"#ccd8cf"},
  "Lavanda":              {hex:"#d6cfe6"},

  // linha 17 — nao usa titanio, tem cores proprias
  "Laranja-cósmico":      {hex:"#d2622c"},
  "Azul-profundo":        {hex:"#2f4257"},
  "Azul-névoa":           {hex:"#b9c8d4"},
  "Sálvia":               {hex:"#c2cdb4"},
  "Rosa-suave":           {hex:"#efd6da", borda:true},

  // iPhone Air
  "Azul-celeste":         {hex:"#c9dce8", borda:true},
  "Dourado-claro":        {hex:"#e6d9bf", borda:true},
  "Branco-nuvem":         {hex:"#efedE8", borda:true}
};

/* cinza neutro para cor que ainda não está no mapa — nunca deixa a bolinha vazia */
function corHex(nome){ return (CORES_APPLE[nome] || {hex:"#8e8e93"}).hex; }
function corPrecisaBorda(nome){ return !!(CORES_APPLE[nome] || {}).borda; }
