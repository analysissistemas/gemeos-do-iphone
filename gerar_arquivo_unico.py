"""
Gera uma versão do sistema em UM ARQUIVO SÓ, pronta pra enviar por WhatsApp/e-mail.

Por que existe: o index.html normal chama a logo de fora (logo-gemeos.png). Se você
mandar só o .html pra alguém, a logo chega quebrada. Este script troca o caminho da
imagem pela imagem inteira embutida no próprio arquivo (base64), então o resultado é
autossuficiente: abre em qualquer computador ou celular, sem pasta, sem internet.

Rodar:  python gerar_arquivo_unico.py
Saída:  Área de Trabalho / Gemeos do iPhone - Sistema.html
"""
import base64
import os
import pathlib
import re

RAIZ = pathlib.Path(__file__).parent
HTML = RAIZ / "index.html"
# branca (usada no tema escuro) e preta (usada no tema claro) — as duas precisam
# ir embutidas, senão o sistema fica sem logo em um dos dois temas
LOGOS = ["logo-gemeos.png", "logo-gemeos-preta.png"]

# Área de Trabalho — funciona mesmo com OneDrive redirecionando a pasta
desktop = pathlib.Path(os.path.join(os.environ["USERPROFILE"], "Desktop"))
if not desktop.exists():
    desktop = pathlib.Path(os.path.join(os.environ["USERPROFILE"], "OneDrive", "Desktop"))

SAIDA = desktop / "Gemeos do iPhone - Sistema.html"

html = HTML.read_text(encoding="utf-8")

total = 0
for nome in LOGOS:
    arq = RAIZ / nome
    if not arq.exists():
        raise SystemExit(f"ERRO: falta o arquivo {nome} — gere a logo antes de rodar isto")
    b64 = base64.b64encode(arq.read_bytes()).decode("ascii")
    datauri = f"data:image/png;base64,{b64}"
    # \. escapado e âncora no src= para não trocar a menção dentro do README/comentário
    html, n = re.subn(rf'src="{re.escape(nome)}"', f'src="{datauri}"', html)
    if n == 0:
        raise SystemExit(f"ERRO: nenhuma referência a {nome} no index.html")
    print(f"  {nome}: embutida em {n} lugar(es)")
    total += n

SAIDA.write_text(html, encoding="utf-8")

print(f"total de imagens embutidas: {total}")
print(f"gerado: {SAIDA}")
print(f"tamanho: {SAIDA.stat().st_size/1024:.0f} KB")
