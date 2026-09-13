# Gêmeos Motors — notas do projeto

> Este arquivo é lido automaticamente pelo Claude Code ao abrir esta pasta.
> É o combinado do projeto. Mantenha atualizado quando algo mudar.

## O que mudou em 08/09/2026 — leia primeiro

Este sistema **era** a "Gêmeos do iPhone", loja de celular. Os donos decidiram
não seguir com o sistema de celulares **por enquanto** e passaram tudo para a
**Gêmeos Motors**, a loja de moto elétrica deles em Goiana.

O sistema de celular não foi perdido. Ele está inteiro em dois lugares:

| Onde | O quê |
|---|---|
| branch `celulares-apple` | o sistema de iPhone como estava, completo |
| `fotos/_apple/` (local, fora do Git) | as 82 fotos da Apple e as logos antigas |

Se um dia voltarem ao celular, é `git checkout celulares-apple` e está tudo lá.

## Onde este projeto vive — leia antes de qualquer git

| | |
|---|---|
| Conta | **analysissistemas** (a empresa, não a conta pessoal) |
| Repositório | `analysissistemas/gemeos-do-iphone` |
| Branch | **`vitrine-html`** |

O nome do repositório ainda é o antigo (`gemeos-do-iphone`) porque renomear
exige acesso pela conta no GitHub. Não muda nada no funcionamento.

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

> A trava foi liberada **uma vez**, em 08/09/2026, com autorização expressa do
> dono, para a virada de celular para moto. Voltou a valer depois disso.

## O dono

Se descreve como **leigo em programação**. Explicar em linguagem simples, sem
jargão, e dar recomendação em vez de cardápio de opções. Ele responde rápido e
manda vários pedidos seguidos — vale confirmar prioridade quando a fila cresce.

## A loja

**Gêmeos Motors**, em **Goiana e Carpina, Pernambuco**. Vende **moto elétrica**
e **triciclo elétrico**, faz **compra, venda e repasse de moto a combustão e de
carro**, vende acessórios e tem **assistência técnica própria**.

A linha elétrica é a que o site oficial mostra e a que tem catálogo público. O
repasse de moto e carro aparece só no Instagram (destaques CLIENTES, MOTOS
COM(bustão), CARROS e MOTOS ELÉTRICAS, e a bio "compra, venda e repasse de
veículos") — por isso não existe tabela de preço dessa linha, e quem define
valor é o cadastro, veículo por veículo.

| | |
|---|---|
| Site oficial | gemeosmotors.com.br (React, feito no Hostinger Horizons) |
| WhatsApp | **5581993869767** — (81) 99386-9767 |
| Instagram | @gemeosmotors_goiana |
| Logo | amarelo e preto, com os dois memojis: "#A MELHOR DA REGIÃO" |

O **site oficial e este sistema são coisas separadas**. O site é uma página
pronta com o catálogo escrito dentro do código; este sistema é a vitrine + a
área da equipe, com estoque, custo, lucro, CRM, funil, caixa e assistência.
Nas **motos elétricas** os dois mostram os mesmos modelos e os mesmos preços —
se um mudar, o outro precisa mudar junto, senão o cliente vê preço diferente em
cada lugar. Carro e moto a combustão existem **só aqui**, porque o site não
tem essa linha.

## Os dois lados, e a regra que não se quebra

| Arquivo | Quem usa | Vê |
|---|---|---|
| `vitrine.html` | Cliente | Foto, cor, ficha técnica, condição, km, preço |
| `index.html` | Equipe | Custo, lucro, margem, CRM, funil, assistência, caixa |
| `login.html` | Equipe | Entrada (usuários: admin / gemeo1 / gemeo2, senha `gemeos123`) |

**Custo, lucro e margem NÃO podem existir dentro do arquivo do cliente.** Não é
esconder na tela: quem abrir o código-fonte também não pode achar. É o
argumento de venda que o dono mais usa.

O login **ainda não protege nada**: sem servidor, a senha é conferida no
navegador e dá para entrar digitando `index.html` direto. O dono sabe e pediu
para tirar o aviso da tela; o alerta técnico continua escrito em `login.html`.

## Decisões de produto já tomadas

- **Cada veículo é peça única** (chassi, quilometragem, avarias, e placa e ano
  quando é emplacado), nunca contagem por modelo. Duas TANK AG11 zero km
  parecem iguais, mas a nota fiscal e a garantia são de uma delas; dois Onix do
  mesmo ano têm Renavam diferente. **Acessórios são por quantidade**: não têm
  chassi nem quilometragem, um capacete é igual ao outro.
- **`eletrico:false` é a chave que separa as duas realidades.** Moto elétrica
  não tem placa, não tem Renavam, não tem ano-modelo e não precisa de CNH. Moto
  a combustão e carro têm tudo isso. É esse campo que decide quais campos o
  cadastro pede, quais avarias ele oferece, quais condições existem e quais
  selos a vitrine mostra.
- **Condição é guardada no masculino e traduzida na hora de mostrar**
  (`condRotulo`). Sem isso a tela escreve "moto seminovo" e "carro seminova" —
  erro de concordância na cara do cliente, numa loja que vende confiança.
- **Veículo de repasse não é "zero km" nem "de vitrine"**: ele chega usado. O
  cadastro de um Gol oferece só Seminovo e Usado — oferecer Zero km seria
  oferecer o que a loja não tem.
- **A quilometragem faz o papel que a saúde da bateria fazia no celular**: é o
  desgaste que o cliente pergunta antes de fechar, e o que puxa o preço.
- **Preço vem do cadastro**, nunca escrito no site. `estoque.js` é a fonte
  única que os dois arquivos leem.
- **Os três "não" são o argumento principal da loja**, e por isso vêm no topo:
  não precisa de CNH, não paga emplacamento, não paga IPVA. Ciclomotor elétrico
  até 32 km/h não exige habilitação — é o que destrava a venda.
  **Eles valem SÓ para a linha elétrica.** Carro e moto a combustão precisam de
  CNH, de placa e pagam IPVA. Repetir esse selo neles seria o site mentindo
  para o cliente: no card deles aparece "Documentação em dia", e o texto da
  seção e do FAQ diz de quem é cada regra. Se um dia alguém for "simplificar"
  isso, essa é a linha que não se apaga.
- **Sem emoji em lugar nenhum** — nem no site, nem na mensagem do WhatsApp.
  No site ficam ícones SVG de traço; na mensagem, o negrito do próprio
  WhatsApp (`*texto*`). Emoji ocupa 4 bytes e chegou como "?" no celular do
  cliente — aconteceu de verdade. Não reintroduzir.
- **A ficha técnica fica no card, não escondida atrás de um clique.** Motor,
  autonomia, velocidade, bateria e recarga são as cinco perguntas que o cliente
  faz de qualquer jeito; quem precisa pedir a ficha no WhatsApp desiste antes.
- **Foto só aparece no produto que ela realmente mostra.** Nada de pôr foto da
  T1 em anúncio da M6 para preencher — a loja vende confiança. Sem foto, o card
  desenha um contorno de moto, que é honesto.
- **A cor de cada modelo é a cor da foto**, conferida uma a uma. Nenhuma cor foi
  inventada: se a loja tiver outras, acrescente em `estoque.js` **e** em
  `cores-motos.js`, com o nome exatamente igual nos dois.
- **Vídeo do hero: "a tropa chegou"**, o vídeo da própria loja com as motos na
  rua. Toca uma vez e para.

## O que é real e o que é exemplo

| Real (veio do site da loja) | Exemplo (troque pelo cadastro) |
|---|---|
| Os 8 modelos elétricos e os preços de tabela | Quantidade em estoque |
| A ficha técnica de cada elétrica | Chassi, placa, ano, Renavam, quilometragem |
| A cor da foto oficial | Custo de compra |
| As fotos das motos e da loja | Clientes, funil, caixa, ordens de serviço |
| WhatsApp, Instagram, cidades | A lista de acessórios |
| Que a loja faz repasse de moto e carro | **Os modelos e preços de moto a combustão e de carro** |

A última linha é a que mais engana: os Honda, Yamaha, Fiat, VW, Chevrolet,
Hyundai e Renault do catálogo são **exemplo**, escolhidos por serem comuns em
repasse no Nordeste. A loja não publica catálogo dessa linha, então não existe
preço oficial — em carro usado o ano e o estado mandam mais que o modelo, e
quem define é o cadastro.

O rodapé da vitrine avisa isso ao cliente, em vez de fingir que o estoque é real.

## Armadilhas que já custaram tempo

- **Cache do navegador.** Os scripts são chamados com `?v=N` em `vitrine.html`.
  **Suba esse número sempre que mexer em `estoque.js`, `cores-motos.js` ou
  `fotos-disponiveis.js`** — sem isso o navegador serve a versão velha e parece
  que a mudança não funcionou. Já enganou várias vezes. Hoje está em `v=12`.
- **`estoque.js` é público.** A vitrine carrega ele, então tudo que está lá
  dentro dá para ler no código-fonte do cliente. **Nunca pôr custo, lucro ou
  margem nele** — até 13/09/2026 ele gerava um `custo` de exemplo que nenhuma
  tela usava e ficava exposto. Custo vive só na cópia de dados do `index.html`.
  Se tirar um `_rnd()` de lá, o sorteio muda e a vitrine mostra outro estoque.
- **`.vercelignore` decide o que sobe para a Vercel.** Notas, scripts, pastas
  com `_`, fotos da Apple e os PNG/JPG originais ficam de fora. Arquivo novo
  que o site precise e que caia numa dessas regras não vai aparecer no ar.
- **`sem_acento` em Python ≠ `semAcento` em JavaScript.** O `isalnum()` do
  Python aceita "ª" como letra e o JavaScript não. Se as duas regras
  discordarem, a foto existe na pasta e o site procura por outro nome — sem
  erro nenhum na tela. O `baixar_fotos_motos.py` usa a mesma regra do
  `estoque.js` de propósito.
- **As fotos vivem em subpasta.** `fotos/motos/` e `fotos/loja/`. Os scripts
  `otimizar_fotos.py` e `gerar_lista_fotos.py` percorrem as subpastas; pastas
  com `_` na frente (como `_apple`) ficam de fora de propósito.
- **Só o `.webp` vai para o GitHub.** Os PNG originais pesam 14 MB e estão no
  `.gitignore`; o site usa os webp (1,2 MB). Depois de acrescentar foto, rodar
  `python otimizar_fotos.py` **e** `python gerar_lista_fotos.py`.
- **O `index.html` tem uma cópia própria dos dados** e não carrega o
  `estoque.js`. Mudou o catálogo? Tem que mudar **nos dois lugares**, senão a
  vitrine e a área da equipe mostram motos diferentes. Unificar os dois é a
  dívida técnica mais antiga do projeto.

## Como mexer

```
python baixar_fotos_motos.py     # baixa a foto oficial de cada moto do site da loja
python otimizar_fotos.py         # gera o .webp (obrigatorio apos baixar)
python gerar_lista_fotos.py      # atualiza fotos-disponiveis.js (obrigatorio)
python gerar_arquivo_unico.py    # versao de arquivo unico, para enviar
python gerar_excel_catalogo.py   # planilha do catalogo
python validar_cores.py          # confere contraste antes de trocar cor
```

O site abre com dois cliques — não precisa de servidor.

## O que falta (em ordem de impacto)

1. **Unificar os dados do `index.html` com o `estoque.js`** — hoje o catálogo
   está escrito duas vezes e pode divergir sem ninguém perceber.
2. **Upload de foto pelo admin** — resolve a foto de moto seminova, que é
   justamente a que mais precisa: o cliente quer ver a moto que vai receber.
3. **Guardar os dados de verdade** — hoje o cadastro vive no navegador de cada
   máquina (localStorage). Com servidor, vale para toda a equipe. O
   `api/estoque.js` (Supabase, na Vercel) é o começo disso e ainda fala a
   linguagem do celular: os campos precisam virar chassi/km/ficha.
4. **As outras cores de cada modelo** — hoje cada moto tem só a cor da foto.
5. Fotos das motos tiradas na loja, para as seminovas.
6. Ordenar por preço e filtros suspensos no catálogo.
