# Gêmeos do iPhone — Sistema da loja

Sistema de gestão da **Gêmeos do iPhone** (Carpina e Goiana, Pernambuco):
venda de iPhones lacrados e seminovos, motinhas elétricas, acessórios e
assistência técnica.

> **Estado atual: protótipo visual.** Todas as telas existem e funcionam de
> navegar, mas os dados são **simulados** — inventados pelo próprio arquivo
> quando você abre. Nada está conectado ao Kommo, ao WhatsApp nem a um banco
> de dados ainda. Serve para você ver o sistema de pé e decidir o que muda
> antes de valer a pena programar o funcionamento de verdade.

## Como abrir

Dê dois cliques em **`index.html`**. Abre no navegador, não precisa instalar
nada, não precisa de internet.

## Como mandar para alguém

O `index.html` chama a logo de um arquivo separado — se você mandar só ele,
a logo chega quebrada. Para gerar uma versão de **arquivo único**:

```
python gerar_arquivo_unico.py
```

Ele cria `Gemeos do iPhone - Sistema.html` na sua Área de Trabalho, com a logo
embutida dentro do próprio arquivo. Esse dá para mandar por WhatsApp ou e-mail
que abre em qualquer celular ou computador.

## O que tem em cada tela

| Tela | Para quê |
|---|---|
| **Visão Geral** | Resumo do dia: receita, aparelhos vendidos, o que está travado |
| **Funil de Vendas** | Cada negócio, da primeira mensagem no WhatsApp até a venda fechada |
| **Clientes (CRM)** | Quem já comprou, quem está negociando, quem tem parcela atrasada |
| **Estoque** | iPhone 7 até 18 Pro Max, motinhas elétricas e acessórios; lacrado x seminovo |
| **Entradas e Saídas** | Todo aparelho que entra ou sai, com IMEI e forma de pagamento |
| **Assistência Técnica** | Ordem de serviço: da bancada até a entrega, com orçamento e garantia |
| **Financeiro** | Recebido, a receber, atrasado, e as parcelas em aberto |

Os botões **Nota** (em Entradas e Saídas e na Assistência) abrem um
comprovante pronto para imprimir ou salvar em PDF.

## Decisões de visual já tomadas

- **Preto e branco**, seguindo a identidade da loja. A única cor que entra é
  sinal de estado (verde disponível, amarelo acabando, vermelho acabou) e
  sempre acompanhada de texto — nunca cor sozinha, para funcionar também para
  quem não distingue cores.
- **Dois temas, claro e escuro**, com o botão ☀/☾ na barra de cima. A escolha
  fica gravada no navegador. Cada tema tem a **sua** paleta, medida contra a
  **sua** superfície (`validar_cores.py` para o escuro, `_tema_claro.py` para
  o claro) — o claro não é o escuro invertido no olho. No claro a rampa perdeu
  o degrau mais claro, que só dava 1,68:1 no branco.
  - **Marcas de gráfico usam classe CSS, nunca cor escrita no SVG**
    (`.mk-f`, `.mk-s`, `.mk-stop`…). Se alguém escrever `fill="#f5f5f7"` direto
    numa barra, ela vira branca no branco e some. É a regra mais fácil de
    quebrar sem perceber aqui.
- **Referências:** o site da Apple (tipografia grande, respiro, preto absoluto,
  parallax) e dois painéis do Pinterest escolhidos pelo dono — um dashboard
  claro com mini-gráficos nos indicadores, e o visual de vidro fosco do
  Apple Vision Pro (painéis translúcidos com profundidade).
- **A logo** foi extraída do material de redes sociais da loja
  (`logo-gemeos.png`, branca com fundo transparente). Por ser branca, **nunca
  use essa logo sobre fundo claro** — ela some. Na nota impressa ela vai dentro
  de um quadrado preto por isso.
- **Contraste conferido por cálculo**, não no olho: `validar_cores.py` mede
  todas as cores contra o fundo. Rode ele de novo se trocar alguma cor.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | O sistema inteiro — telas, estilo e dados simulados em um arquivo só |
| `logo-gemeos.png` | Logo da loja, branca, fundo transparente |
| `gerar_arquivo_unico.py` | Gera a versão de arquivo único para enviar |
| `validar_cores.py` | Confere se as cores têm contraste suficiente |

## O que falta decidir

1. **Onde o sistema vai rodar** — só na loja, ou acessível de fora também?
2. **Nota fiscal de verdade (NF-e)** — o que existe hoje é um comprovante
   interno da loja. Emitir NF-e válida na SEFAZ exige certificado digital e é
   um projeto à parte; precisa confirmar se a loja emite nota fiscal.
3. **Kommo** — precisa da chave de API para puxar contatos e funil.
4. **Quem usa o sistema** — quantas pessoas, e quem pode ver o quê.
