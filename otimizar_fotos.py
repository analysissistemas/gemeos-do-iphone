"""
Deixa as fotos leves sem perder qualidade na tela.

O problema: as fotos baixadas da Apple vêm em PNG de 1200x1200, com 0,5 a 1,8 MB
cada. No catálogo elas aparecem com cerca de 300 pixels. Ou seja, o cliente
baixa 1,8 MB para ver uma imagem de 300px — no celular, na rede da rua, isso é
a diferença entre a loja abrir rápido ou o cliente desistir.

O que este script faz: gera uma versão WEBP de 800px de cada foto. O WebP
guarda transparência igual ao PNG e costuma ficar 10 vezes menor. O site tenta
o .webp primeiro e cai no .png se não existir.

Rodar:  python otimizar_fotos.py
Depois: python gerar_lista_fotos.py
"""
import os
from PIL import Image

PASTA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fotos")
LARGURA_MAX = 800          # o dobro do tamanho na tela, para telas retina
QUALIDADE = 82             # acima disso o ganho de tamanho não compensa


def otimizar(caminho):
    nome, ext = os.path.splitext(os.path.basename(caminho))
    destino = os.path.join(PASTA, nome + ".webp")
    if os.path.exists(destino):
        return None

    im = Image.open(caminho)
    # RGBA preserva o fundo transparente das fotos oficiais
    im = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")

    if im.width > LARGURA_MAX:
        altura = round(im.height * LARGURA_MAX / im.width)
        im = im.resize((LARGURA_MAX, altura), Image.LANCZOS)

    im.save(destino, "WEBP", quality=QUALIDADE, method=6)
    return destino


def main():
    antes = depois = 0
    feitos = 0
    for arq in sorted(os.listdir(PASTA)):
        if not arq.lower().endswith((".png", ".jpg", ".jpeg")):
            continue
        origem = os.path.join(PASTA, arq)
        if not os.path.isfile(origem):
            continue
        tam_antes = os.path.getsize(origem)
        try:
            destino = otimizar(origem)
        except Exception as e:
            print(f"  ERRO  {arq}: {type(e).__name__}")
            continue
        if destino is None:
            continue
        tam_depois = os.path.getsize(destino)
        antes += tam_antes
        depois += tam_depois
        feitos += 1
        print(f"  {arq:44} {tam_antes//1024:5} KB -> {tam_depois//1024:4} KB")

    if feitos:
        print(f"\n{feitos} fotos convertidas")
        print(f"antes:  {antes/1024/1024:6.1f} MB")
        print(f"depois: {depois/1024/1024:6.1f} MB")
        print(f"economia: {100 - depois*100/antes:.0f}%")
    else:
        print("nada a converter — todas já têm versão .webp")


if __name__ == "__main__":
    main()
