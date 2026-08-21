"""
Baixa a foto oficial de cada aparelho, uma por MODELO e COR.

De onde vem: o servidor de imagens da propria Apple, o mesmo que a loja dela usa.
O `fmt=png-alpha` entrega o aparelho SOZINHO, com fundo transparente - sem mao,
sem cenario, sem outro aparelho do lado.

A Apple usa DOIS padroes de nome, e foi isso que derrubou a primeira versao:

    iphone-17-pro-max-finish-select-silver-202509   <- linha nova
    iphone-16-plus-ultramarine-select-202409        <- a cor vem ANTES de "select"

O script tenta os dois, e ainda varre algumas datas provaveis, porque o codigo
ano-mes muda de modelo para modelo. O que responder imagem grande, vale.

Rodar:  python baixar_fotos_apple.py
Saida:  fotos/iphone-15-pro-titanio-natural.png
"""
import os
import time
import unicodedata
import urllib.error
import urllib.request

BASE = "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/"
QUERY = "?wid=1200&hei=1200&fmt=png-alpha"
DESTINO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fotos")
MINIMO = 40_000          # abaixo disso e erro disfarcado ou bolinha de cor

# modelo do site -> (slug da Apple, datas a tentar, {cor do site: cor da Apple})
MODELOS = {
    # a linha 17 nao usa titanio: tem cores proprias
    "iPhone 17 Pro Max": ("iphone-17-pro-max", ["202509"], {
        "Prata": "silver", "Laranja-cósmico": "cosmicorange", "Azul-profundo": "deepblue"}),
    "iPhone 17 Pro": ("iphone-17-pro", ["202509"], {
        "Prata": "silver", "Laranja-cósmico": "cosmicorange", "Azul-profundo": "deepblue"}),
    "iPhone 17": ("iphone-17", ["202509"], {
        "Preto": "black", "Branco": "white", "Azul-névoa": "mistblue",
        "Lavanda": "lavender", "Sálvia": "sage"}),
    # linha "e" (mais em conta) e o Air (o mais fino)
    "iPhone 17e": ("iphone-17e", ["202603", "202602"], {
        "Preto": "black", "Branco": "white", "Rosa-suave": "softpink"}),
    "iPhone 16e": ("iphone-16e", ["202502", "202503"], {
        "Preto": "black", "Branco": "white"}),
    "iPhone Air": ("iphone-air", ["202509"], {
        "Preto-espacial": "spaceblack", "Branco-nuvem": "cloudwhite",
        "Dourado-claro": "lightgold", "Azul-celeste": "skyblue"}),

    "iPhone 16 Pro Max": ("iphone-16-pro-max", ["202409"], {
        "Titânio Natural": "naturaltitanium", "Titânio Preto": "blacktitanium",
        "Titânio Branco": "whitetitanium", "Titânio Deserto": "desert-titanium"}),
    "iPhone 16 Pro": ("iphone-16-pro", ["202409"], {
        "Titânio Natural": "naturaltitanium", "Titânio Preto": "blacktitanium",
        "Titânio Branco": "whitetitanium", "Titânio Deserto": "desert-titanium"}),
    "iPhone 16 Plus": ("iphone-16-plus", ["202409"], {
        "Preto": "black", "Branco": "white", "Rosa": "pink",
        "Verde-acinzentado": "teal", "Ultramarino": "ultramarine"}),
    "iPhone 16": ("iphone-16", ["202409"], {
        "Preto": "black", "Branco": "white", "Rosa": "pink",
        "Verde-acinzentado": "teal", "Ultramarino": "ultramarine"}),

    "iPhone 15 Pro Max": ("iphone-15-pro-max", ["202309"], {
        "Titânio Natural": "naturaltitanium", "Titânio Azul": "bluetitanium",
        "Titânio Branco": "whitetitanium", "Titânio Preto": "blacktitanium"}),
    "iPhone 15 Pro": ("iphone-15-pro", ["202309"], {
        "Titânio Natural": "naturaltitanium", "Titânio Azul": "bluetitanium",
        "Titânio Branco": "whitetitanium", "Titânio Preto": "blacktitanium"}),
    "iPhone 15 Plus": ("iphone-15-plus", ["202309"], {
        "Preto": "black", "Azul": "blue", "Verde": "green", "Amarelo": "yellow", "Rosa": "pink"}),
    "iPhone 15": ("iphone-15", ["202309"], {
        "Preto": "black", "Azul": "blue", "Verde": "green", "Amarelo": "yellow", "Rosa": "pink"}),

    # ⚠️ TENTADO E FALHOU (2026-08-21): mesmo caso do 12 Pro/13 Pro/13 Pro
    # Max -- saiu de linha em set/2023 e a Apple parece ter removido a
    # imagem. Testado com "202209"/"2022"/"202210", com e sem "-finish-":
    # sempre 404. Caminho: foto tirada na loja.
    "iPhone 14 Pro Max": ("iphone-14-pro-max", ["202209"], {
        "Roxo-profundo": "deeppurple", "Dourado": "gold",
        "Prata": "silver", "Preto-espacial": "spaceblack"}),
    "iPhone 14 Pro": ("iphone-14-pro", ["202209"], {
        "Roxo-profundo": "deeppurple", "Dourado": "gold",
        "Prata": "silver", "Preto-espacial": "spaceblack"}),
    "iPhone 14 Plus": ("iphone-14-plus", ["202209", "202303"], {
        "Azul": "blue", "Roxo": "purple", "Meia-noite": "midnight",
        "Estelar": "starlight", "Vermelho": "red"}),
    "iPhone 14": ("iphone-14", ["202209", "202303"], {
        "Azul": "blue", "Roxo": "purple", "Meia-noite": "midnight",
        "Estelar": "starlight", "Vermelho": "red"}),

    # ⚠️ iPhone 11 "normal" TENTADO E FALHOU (2026-08-21): nenhuma cor/data
    # respondeu (testado black/white/green/yellow/purple/red, 2019 a 2020,
    # com e sem "-finish-"). Saiu de linha em set/2023 -- CDN parece ter
    # removido, igual o 12 Pro. Caminho: foto tirada na loja.
    # iPhone 11 Pro/Pro Max: 3 das 4 cores respondem (falta Cinza-espacial/
    # spacegray, testado varias grafias sem sucesso) -- melhor que nada.
    "iPhone 11 Pro Max": ("iphone-11-pro-max", ["2019"], {
        "Prata": "silver", "Dourado": "gold", "Verde-meia-noite": "midnight-green"}),
    "iPhone 11 Pro": ("iphone-11-pro", ["2019"], {
        "Prata": "silver", "Dourado": "gold", "Verde-meia-noite": "midnight-green"}),

    # Verde/Vermelho TENTADO E FALHOU (2026-08-21): so as 4 cores de lancamento
    # respondem (com data "2021", so o ano) -- Verde e Vermelho vieram numa
    # atualizacao de meio de ciclo em 2022 e nao acharam data/nome que funcione.
    "iPhone 13": ("iphone-13", ["2021", "202207", "202209", "202108"], {
        "Rosa": "pink", "Azul": "blue", "Meia-noite": "midnight",
        "Estelar": "starlight", "Verde": "green", "Vermelho": "red"}),
    "iPhone 13 mini": ("iphone-13-mini", ["2021", "202207", "202209", "202108"], {
        "Rosa": "pink", "Azul": "blue", "Meia-noite": "midnight", "Estelar": "starlight"}),

    # ⚠️ TENTADO E FALHOU (2026-08-21): iPhone 13 Pro / 13 Pro Max, mesmo
    # problema do 12 Pro — saiu de linha em set/2023 e a Apple parece ter
    # removido a imagem do CDN. Testado com iphone-13-pro(-max), varias
    # cores (graphite/silver/gold/sierrablue/alpinegreen) e datas (2021,
    # 202109 a 202203), com e sem "-finish-", sem "fmt=png-alpha": sempre 404.
    # Caminho que resolve: foto tirada na loja, pelo cadastro do admin.

    # Diferente do 12 Pro (abaixo): o iPhone 12 "normal" ainda responde no CDN.
    # Data e so o ano, sem mes — e o Roxo (lancado depois, abr/2021) pede
    # "2021" em vez de "2020"; por isso as duas datas na lista.
    "iPhone 12": ("iphone-12", ["2020", "2021"], {
        "Preto": "black", "Branco": "white", "Verde": "green",
        "Azul": "blue", "Vermelho": "red", "Roxo": "purple"}),

    # ⚠️ TENTADO E FALHOU (2026-08-20): nenhuma data/padrao respondeu pra
    # nenhuma cor. iPhone 12 Pro saiu de linha faz tempo (a Apple parou de
    # vender em set/2021) e parece que o CDN da Apple removeu a imagem
    # junto — mesma situacao do Apple Watch, so que por outro motivo.
    # Caminho que resolve: foto tirada na loja, pelo cadastro do admin.
    "iPhone 12 Pro": ("iphone-12-pro", ["202010", "202011", "202009", "2020"], {
        "Grafite": "graphite", "Prata": "silver", "Dourado": "gold", "Azul-pacífico": "pacificblue"}),
}

# os dois jeitos que a Apple nomeia o arquivo
PADROES = [
    "{slug}-finish-select-{cor}-{data}",
    "{slug}-{cor}-select-{data}",
]

def variantes_de_cor(cor):
    """A Apple escreve a mesma cor de jeitos diferentes conforme a geração:
    naturaltitanium, natural-titanium, titanium-natural. Em vez de adivinhar
    qual vale para cada modelo, tentamos todas — a que responder imagem, vale."""
    v = [cor]
    if "titanium" in cor and "-" not in cor:
        base = cor.replace("titanium", "")
        v += [f"{base}-titanium", f"titanium-{base}"]
    if "-" in cor:
        v.append(cor.replace("-", ""))
    return list(dict.fromkeys(v))          # sem repetir, mantendo a ordem


# Fora do iPhone, cada linha da Apple nomeia o arquivo de um jeito. Em vez de
# tentar uma regra geral, aqui vai o molde exato de cada modelo: {cor} e o
# unico buraco a preencher.
MODELOS_EXATOS = {
    "iPad Pro 11\" M4":     ("ipad-pro-11-select-wifi-{cor}-202405",
                             {"Preto-espacial": "spaceblack", "Prata": "silver"}),
    "iPad Pro 13\" M4":     ("ipad-pro-13-select-wifi-{cor}-202405",
                             {"Preto-espacial": "spaceblack", "Prata": "silver"}),
    "iPad Air 11\" M3":     ("ipad-air-select-11in-wifi-{cor}-202405",
                             {"Cinza-espacial": "spacegray", "Azul": "blue",
                              "Roxo": "purple", "Estelar": "starlight"}),
    "iPad Air 13\" M3":     ("ipad-air-select-13in-wifi-{cor}-202405",
                             {"Cinza-espacial": "spacegray", "Azul": "blue",
                              "Roxo": "purple", "Estelar": "starlight"}),
    "iPad mini (A17 Pro)":  ("ipad-mini-select-wifi-{cor}-202410",
                             {"Cinza-espacial": "spacegray", "Azul": "blue",
                              "Roxo": "purple", "Estelar": "starlight"}),
    "iPad (11ª geração)":   ("ipad-2022-hero-{cor}-wifi-select",
                             {"Azul": "blue", "Rosa": "pink",
                              "Amarelo": "yellow", "Prata": "silver"}),

    # ⚠️ APPLE WATCH NÃO FUNCIONA por este caminho, e já foi testado.
    # O que a página do Watch expõe é o nome da BOLINHA de cor, que termina
    # em _SW_COLOR. Tirar esse sufixo não dá a foto do produto — o arquivo do
    # relógio tem outro nome, que não aparece no HTML e não se deduz.
    # Testadas e recusadas: ...-cell-s11, ...-nc-s11, ...-ultra3, ...-nc-se3.
    # Caminho que resolve: foto tirada na loja, pelo cadastro do admin.
    # As linhas abaixo ficam como registro do que já foi tentado.
    "Apple Watch Series 11": ("watch-case-42-aluminum-{cor}-nc-s11",
                              {"Cinza-espacial": "spacegray", "Prata": "silver",
                               "Ouro-rosé": "rosegold", "Preto-jato": "jetblack"}),
    "Apple Watch SE 3":      ("watch-case-40-aluminum-{cor}-nc-se3",
                              {"Meia-noite": "midnight", "Estelar": "starlight"}),
    "Apple Watch Ultra 3":   ("watch-case-49-titanium-{cor}-ultra3",
                              {"Titânio Natural": "natural", "Titânio Preto": "black"}),

    # Mac
    "MacBook Neo":           ("macbook-neo-{cor}-cto-hero-202603",
                              {"Prata": "silver", "Blush": "blush",
                               "Citrus": "citrus", "Índigo": "indigo"}),
    # iMac removido: a loja vende notebook, não computador de mesa.
}


def sem_acento(s):
    """Precisa dar EXATAMENTE o mesmo resultado que a funcao semAcento() do
    estoque.js — e o nome do arquivo que liga um ao outro. Cuidado com o
    `isalnum()` do Python: ele aceita "ª" e "²" como letra, o JavaScript nao.
    Por isso a regra aqui e apenas a-z e 0-9, nada mais."""
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    limpo = "".join(c if ("a" <= c <= "z" or "0" <= c <= "9") else "-" for c in s.lower())
    return "-".join(p for p in limpo.split("-") if p)


def tentar(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            dados = r.read()
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError):
        return None
    return dados if len(dados) >= MINIMO else None


def main():
    os.makedirs(DESTINO, exist_ok=True)
    ok = falhou = pulou = 0
    for modelo, (slug, datas, cores) in MODELOS.items():
        for cor_site, cor_apple in cores.items():
            nome = f"{sem_acento(modelo)}-{sem_acento(cor_site)}.png"
            caminho = os.path.join(DESTINO, nome)
            if os.path.exists(caminho):
                pulou += 1
                continue

            dados = None
            for data in datas:
                for variante in variantes_de_cor(cor_apple):
                    for padrao in PADROES:
                        arq = padrao.format(slug=slug, cor=variante, data=data)
                        dados = tentar(BASE + arq + QUERY)
                        time.sleep(0.15)          # educação com o servidor
                        if dados:
                            break
                    if dados:
                        break
                if dados:
                    break

            if dados:
                with open(caminho, "wb") as f:
                    f.write(dados)
                print(f"  OK    {nome}  {len(dados)//1024} KB")
                ok += 1
            else:
                print(f"  ---   {nome}  (nenhum padrao/data respondeu)")
                falhou += 1

    # modelos com molde de nome exato (iPad, e o que mais for entrando)
    for modelo, (molde, cores) in MODELOS_EXATOS.items():
        for cor_site, cor_apple in cores.items():
            nome = f"{sem_acento(modelo)}-{sem_acento(cor_site)}.png"
            caminho = os.path.join(DESTINO, nome)
            if os.path.exists(caminho):
                pulou += 1
                continue
            dados = tentar(BASE + molde.format(cor=cor_apple) + QUERY)
            time.sleep(0.2)
            if dados:
                with open(caminho, "wb") as f:
                    f.write(dados)
                print(f"  OK    {nome}  {len(dados)//1024} KB")
                ok += 1
            else:
                print(f"  ---   {nome}")
                falhou += 1

    print(f"\nbaixadas {ok} | sem foto {falhou} | ja existiam {pulou}")
    print(f"total na pasta: {len([f for f in os.listdir(DESTINO) if f.endswith(('.png','.jpg'))])}")


if __name__ == "__main__":
    main()
