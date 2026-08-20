# Gêmeos do iPhone — notas do projeto

> Este arquivo é lido automaticamente pelo Claude Code ao abrir esta pasta.
> É o combinado do projeto. Mantenha atualizado quando algo mudar.

## Onde este projeto vive — leia antes de qualquer git

| | |
|---|---|
| Conta | **analysissistemas** (a empresa, não a conta pessoal) |
| Repositório | `analysissistemas/gemeos-do-iphone` |
| Branch | **`vitrine-html`** |

**A branch `main` do mesmo repositório é OUTRO sistema**, feito em Next.js +
Supabase pelo **Leo** (sócio do dono), com a IA de atendimento "Milton". Nunca
enviar nada para `main`, nunca fazer merge das duas. São duas abordagens
diferentes para a mesma loja, e a decisão de qual segue é dos sócios.

A branch local já se chama `vitrine-html` e rastreia a do GitHub, então
`git push` simples basta. **Combinado com o dono: commitar e enviar sempre,
sem precisar perguntar a cada vez.**

Clonar em outra máquina:

```
git clone -b vitrine-html https://github.com/analysissistemas/gemeos-do-iphone
```

Sem o `-b`, vem o sistema do Leo.

## Trava: `vitrine.html` não se mexe sem autorização explícita

**Nunca editar `vitrine.html` por conta própria** — nem para "melhorar", nem
como efeito colateral de mexer em outra coisa. Antes de qualquer edição
nesse arquivo específico, pedir confirmação nomeando o arquivo
(`vitrine.html`) e o que vai mudar, e esperar um "sim" claro.

Se o pedido for sobre dado (estoque, preço, foto, categoria), o caminho é
mexer no banco (Supabase) ou no `estoque.js`/`index.html` — o `vitrine.html`
só lê o que os outros produzem, quase nunca precisa mudar por dentro.

**Por quê:** numa sessão de 2026-08-16, o dono pediu reversão de código várias
vezes seguidas achando que `vitrine.html` tinha sido alterado, quando na
prática o arquivo nunca mudou (só o banco por trás dele, ou o `index.html`) —
o `git diff` provou isso repetidas vezes. A ansiedade em torno desse arquivo
específico é alta; tratar como intocável por padrão evita esse ciclo.

## O dono

Se descreve como **leigo em programação**. Explicar em linguagem simples, sem
jargão, e dar recomendação em vez de cardápio de opções. Ele responde rápido e
manda vários pedidos seguidos — vale confirmar prioridade quando a fila cresce.

Loja em **Carpina e Goiana, Pernambuco**. Vende iPhone lacrado e seminovo,
iPad, Apple Watch, MacBook, acessórios, motos elétricas, PlayStation, Xbox,
Starlink — e tem **assistência técnica própria**.

WhatsApp da loja no site: **5581993116436**.

## Os dois lados, e a regra que não se quebra

| Arquivo | Quem usa | Vê |
|---|---|---|
| `vitrine.html` | Cliente | Foto, cor, memória, bateria, avarias, preço |
| `index.html` | Equipe | Custo, lucro, margem, CRM, funil, assistência, caixa |
| `login.html` | Equipe | Entrada (usuários: admin / gemeo1 / gemeo2, senha `gemeos123`) |

**Custo, lucro e margem NÃO podem existir dentro do arquivo do cliente.** Não é
esconder na tela — quem abrir o código-fonte não pode achar. É o argumento de
venda que o dono mais usa.

O login **ainda não protege nada**: sem servidor, a senha é conferida no
navegador e dá para entrar digitando `index.html` direto. O dono sabe e pediu
para tirar o aviso da tela; o alerta técnico continua escrito em `login.html`.

## Decisões de produto já tomadas

- **Cada iPhone é peça única** (IMEI, bateria, avarias), nunca contagem por
  modelo — bateria e avaria são do aparelho, não do modelo. Acessórios,
  motos, consoles e Starlink são **por quantidade**: não têm bateria nem IMEI.
- **Preço vem do cadastro**, nunca escrito no site. `estoque.js` é a fonte
  única que os dois arquivos leem.
- **Sem emoji em lugar nenhum** — nem no site, nem na mensagem do WhatsApp.
  No site ficam ícones SVG de traço; na mensagem, o negrito do próprio
  WhatsApp (`*texto*`). Emoji ocupa 4 bytes e chegou como "?" no celular do
  cliente — aconteceu de verdade. Não reintroduzir.
- **Slogan: "Pra tudo tem solução"**, que é do material da própria loja.
  Não usar "Apple com procedência": além de a loja não vender só Apple, é
  praticamente o slogan do concorrente que serviu de referência (emimportsoficial).
- **Foto só aparece no produto que ela realmente mostra.** Nada de pôr foto de
  iPhone 11 em anúncio de iPhone 15 para preencher — a loja vende confiança.
  Sem foto, o card desenha um contorno, que é honesto.
- **Vídeo do hero: iPhone 17 Pro**, toca uma vez e para. O do iPhone Air ficou
  na pasta como alternativa descartada.

## Armadilhas que já custaram tempo

- **Cache do navegador.** Os scripts são chamados com `?v=N` em `vitrine.html`.
  **Suba esse número sempre que mexer em `estoque.js`, `cores-apple.js` ou
  `fotos-disponiveis.js`** — sem isso o navegador serve a versão velha e parece
  que a mudança não funcionou. Já enganou várias vezes.
- **`sem_acento` em Python ≠ `semAcento` em JavaScript.** O `isalnum()` do
  Python aceita "ª" como letra e o JavaScript não. Isso salvava
  `ipad-11ª-geracao.png` enquanto o site procurava `ipad-11-geracao.png` — a
  foto existia e nunca aparecia, sem erro nenhum na tela.
- **Fotos: cada linha da Apple nomeia o arquivo diferente.** iPhone novo é
  `-finish-select-COR-DATA`, o 16 e anteriores é `-COR-select-DATA`, iPad e
  Watch têm moldes próprios (ver `MODELOS_EXATOS` em `baixar_fotos_apple.py`).
  O Apple Watch só sai pela página de **comparação**, não pela de compra.
- **PS5, Xbox, Starlink e JBL não têm foto oficial obtível.** Sony, Microsoft
  e Starlink não publicam recorte de produto com fundo transparente como a
  Apple. Já foi tentado por vários caminhos. **Não gastar tempo nisso de novo**
  — a saída é a foto tirada na loja.
- **Só o `.webp` vai para o GitHub.** Os PNG originais pesam 70 MB e estão no
  `.gitignore`; o site usa os webp (1,5 MB). Depois de acrescentar foto, rodar
  `python otimizar_fotos.py` **e** `python gerar_lista_fotos.py`.

## Como mexer

```
python baixar_fotos_apple.py     # baixa foto oficial por modelo e cor
python otimizar_fotos.py         # gera o .webp (obrigatório após baixar)
python gerar_lista_fotos.py      # atualiza fotos-disponiveis.js (obrigatório)
python gerar_arquivo_unico.py    # versão de arquivo único, para enviar
python gerar_excel_catalogo.py   # planilha do catálogo
python validar_cores.py          # confere contraste antes de trocar cor
```

O site abre com dois cliques — não precisa de servidor.

## O que falta (em ordem de impacto)

1. **Upload de foto pelo admin** — resolve PS5, Xbox, Starlink, iPhone antigo e
   qualquer produto novo de uma vez. É a peça que destrava o resto.
2. **Guardar os dados de verdade** — hoje o cadastro vive no navegador de cada
   máquina (localStorage). Com servidor, vale para toda a equipe.
3. Ordenar por preço e filtros suspensos no catálogo.
4. Modo noturno na vitrine (o sistema já tem).
5. Fotos de MacBook Air e Pro (só o Neo tem).
