"""
Baixa a foto oficial de cada moto do site da propria loja.

De onde vem: o site gemeosmotors.com.br guarda as fotos no CDN da Hostinger,
em alta resolucao e com o recorte limpo que a fabrica manda. E a MESMA foto que
o cliente ja ve no site — entao a vitrine e o site nunca discordam.

Como funciona: o site e feito em React e o catalogo vive dentro do arquivo
JavaScript da pagina. O script le esse arquivo, acha a lista de motos e baixa a
foto de cada uma com o nome do modelo (sem acento, com hifen).

Rodar:  python baixar_fotos_motos.py
Depois: python otimizar_fotos.py      (obrigatorio — gera o .webp)
        python gerar_lista_fotos.py   (obrigatorio — atualiza fotos-disponiveis.js)

Se a loja trocar de site, so a funcao achar_bundle() muda.
"""
import os, re, json, unicodedata, urllib.request

SITE = "https://gemeosmotors.com.br"
DESTINO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fotos", "motos")
UA = {"User-Agent": "Mozilla/5.0"}


def baixar(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read()


def sem_acento(s):
    """Mesma regra do semAcento() do estoque.js — os dois lados TEM que combinar,
    senao a foto existe na pasta e o site procura por outro nome."""
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"-+$", "", re.sub(r"[^a-z0-9]+", "-", s).lstrip("-"))


def achar_bundle():
    """O <script type=module src=...> da pagina inicial e o codigo do site."""
    html = baixar(SITE).decode("utf-8", "replace")
    m = re.search(r'src="(/assets/index-[^"]+\.js)"', html)
    if not m:
        raise SystemExit("Nao achei o arquivo de codigo do site. O site mudou?")
    return baixar(SITE + m.group(1)).decode("utf-8", "replace")


def achar_motos(js):
    """Le a lista de motos de dentro do codigo. Nao e JSON: as chaves vem sem
    aspas (id:"tank"), entao um regex simples resolve melhor que um parser."""
    return [{"nome": nome, "url": url} for nome, url in
            re.findall(r'name:"([^"]+)",price:"[^"]*",img:"([^"]+)"', js)]


def main():
    os.makedirs(DESTINO, exist_ok=True)
    motos = achar_motos(achar_bundle())
    if not motos:
        raise SystemExit("O site respondeu, mas nao achei nenhuma moto no catalogo.")

    novas = 0
    for m in motos:
        ext = os.path.splitext(m["url"])[1].split("?")[0] or ".png"
        caminho = os.path.join(DESTINO, sem_acento(m["nome"]) + ext)
        if os.path.exists(caminho):
            print(f"  ja tinha: {os.path.basename(caminho)}")
            continue
        with open(caminho, "wb") as f:
            f.write(baixar(m["url"]))
        novas += 1
        print(f"  baixada: {os.path.basename(caminho)}  ({os.path.getsize(caminho)//1024} KB)")

    print(f"\n{len(motos)} motos no catalogo do site, {novas} foto(s) nova(s).")
    if novas:
        print("Agora rode:  python otimizar_fotos.py  e depois  python gerar_lista_fotos.py")


if __name__ == "__main__":
    main()
