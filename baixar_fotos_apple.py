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
    "iPhone 17 Pro Max": ("iphone-17-pro-max", ["202509"], {
        "Titânio Prata": "silver", "Titânio Natural": "cosmicorange", "Titânio Preto": "deepblue"}),
    "iPhone 17 Pro": ("iphone-17-pro", ["202509"], {
        "Titânio Prata": "silver", "Titânio Natural": "cosmicorange", "Titânio Preto": "deepblue"}),
    "iPhone 17": ("iphone-17", ["202509"], {
        "Preto": "black", "Branco": "white", "Azul": "mistblue", "Lavanda": "lavender"}),

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

    "iPhone 13": ("iphone-13", ["202207", "202209", "202108"], {
        "Rosa": "pink", "Azul": "blue", "Meia-noite": "midnight",
        "Estelar": "starlight", "Verde": "green", "Vermelho": "red"}),
    "iPhone 13 mini": ("iphone-13-mini", ["202207", "202209", "202108"], {
        "Rosa": "pink", "Azul": "blue", "Meia-noite": "midnight", "Estelar": "starlight"}),
}

# os dois jeitos que a Apple nomeia o arquivo
PADROES = [
    "{slug}-finish-select-{cor}-{data}",
    "{slug}-{cor}-select-{data}",
]


def sem_acento(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    limpo = "".join(c if c.isalnum() else "-" for c in s.lower())
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
                for padrao in PADROES:
                    arq = padrao.format(slug=slug, cor=cor_apple, data=data)
                    dados = tentar(BASE + arq + QUERY)
                    time.sleep(0.2)          # educação com o servidor
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

    print(f"\nbaixadas {ok} | sem foto {falhou} | ja existiam {pulou}")
    print(f"total na pasta: {len([f for f in os.listdir(DESTINO) if f.endswith(('.png','.jpg'))])}")


if __name__ == "__main__":
    main()
