"""
Tira o fundo branco das fotos das motos.

Por que existe: as fotos oficiais do site vem com fundo BRANCO chapado, nao
transparente. No card isso passa despercebido (o card tambem e claro), mas no
topo da vitrine, que e escuro, a moto aparecia dentro de um retangulo cinza —
parecia erro de carregamento.

Como funciona: um balde de tinta a partir das QUATRO QUINAS, nao um corte por
cor. A diferenca importa muito aqui: metade das motos da loja e BRANCA, e um
corte por cor comeria a lataria junto com o fundo. Comecando pelas quinas, so
sai o branco que encosta na borda; o branco de dentro da moto fica.

A tolerancia diz o quanto de cinza claro ainda conta como fundo — sombra suave
de estudio entra, a lataria nao.

Rodar:  python recortar_fundo_motos.py
Depois: nada. Ele ja grava o .webp que o site usa.
"""
import os, glob
from PIL import Image, ImageDraw, ImageFilter

PASTA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fotos", "motos")
LARGURA_MAX = 800
QUALIDADE = 88
TOLERANCIA = 78          # conferido moto a moto: em 38 e 60 sobrava a poca de
                         # sombra do estudio no chao; em 95 comecava a comer a
                         # lataria das motos brancas. 78 e o meio que limpa a
                         # sombra e mantem a moto inteira.


def recortar(caminho):
    im = Image.open(caminho).convert("RGB")
    # uma margem branca em volta garante que as quinas sejam fundo mesmo quando
    # a moto encosta na borda do quadro
    m = 2
    base = Image.new("RGB", (im.width + m*2, im.height + m*2), (255, 255, 255))
    base.paste(im, (m, m))

    # o balde pinta o fundo de magenta; depois o magenta vira transparente.
    # Magenta porque nao existe nessa cor em foto de moto — se existisse,
    # o buraco apareceria no lugar errado e daria para ver na hora.
    MARCA = (255, 0, 255)
    for quina in [(0, 0), (base.width-1, 0), (0, base.height-1), (base.width-1, base.height-1)]:
        ImageDraw.floodfill(base, quina, MARCA, thresh=TOLERANCIA)

    rgba = base.convert("RGBA")
    dados = rgba.getdata()
    novo = [(0, 0, 0, 0) if (p[0] > 230 and p[1] < 40 and p[2] > 230) else p for p in dados]
    rgba.putdata(novo)
    rgba = rgba.crop((m, m, rgba.width - m, rgba.height - m))

    # o balde deixa a borda serrilhada; um desfoque de meio pixel SO no canal
    # alpha suaviza o contorno sem borrar a moto
    alpha = rgba.getchannel("A").filter(ImageFilter.GaussianBlur(0.6))
    rgba.putalpha(alpha)

    # sobrou fundo? Se quase nada virou transparente, o recorte falhou e e
    # melhor manter a foto original do que entregar um retangulo branco.
    transparente = sum(1 for p in rgba.getdata() if p[3] < 20)
    if transparente < rgba.width * rgba.height * 0.05:
        return None, 0

    caixa = rgba.getbbox()
    if caixa:
        rgba = rgba.crop(caixa)
    if rgba.width > LARGURA_MAX:
        rgba = rgba.resize((LARGURA_MAX, round(rgba.height * LARGURA_MAX / rgba.width)), Image.LANCZOS)
    return rgba, transparente


def main():
    originais = sorted(glob.glob(os.path.join(PASTA, "*.png")))
    if not originais:
        raise SystemExit("Nao achei os PNG originais em fotos/motos/. "
                         "Rode antes:  python baixar_fotos_motos.py")
    feitos = 0
    for caminho in originais:
        nome = os.path.splitext(os.path.basename(caminho))[0]
        destino = os.path.join(PASTA, nome + ".webp")
        rgba, transp = recortar(caminho)
        if rgba is None:
            print(f"  PULOU  {nome}: o fundo nao saiu, foto mantida como estava")
            continue
        rgba.save(destino, "WEBP", quality=QUALIDADE, method=6)
        feitos += 1
        pc = 100 * transp / (rgba.width * rgba.height)
        print(f"  {nome:14} {rgba.width}x{rgba.height}  {os.path.getsize(destino)//1024:3} KB")
    print(f"\n{feitos} fotos com fundo recortado.")


if __name__ == "__main__":
    main()
