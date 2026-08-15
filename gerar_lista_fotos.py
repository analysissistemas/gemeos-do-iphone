import os, json
pasta = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fotos")
todos = sorted(f for f in os.listdir(pasta) if f.lower().endswith((".webp", ".png", ".jpg", ".jpeg")))
webps = {os.path.splitext(f)[0] for f in todos if f.lower().endswith(".webp")}
# Um PNG que já tem .webp gêmeo NÃO entra na lista: ele fica só nesta máquina
# (está no .gitignore), então listá-lo faria o site procurar, depois de clonar,
# um arquivo que não existe — e cair no contorno sem necessidade.
arqs = [f for f in todos
        if f.lower().endswith(".webp") or os.path.splitext(f)[0] not in webps]
cab = """/* ============================================================
   LISTA DAS FOTOS QUE EXISTEM NA PASTA fotos/
   ------------------------------------------------------------
   GERADO AUTOMATICAMENTE por gerar_lista_fotos.py — nao edite a mao.
   Rode o script de novo toda vez que acrescentar ou tirar foto.

   Para que serve: o navegador nao consegue perguntar "esse arquivo existe?"
   sem tentar baixar. Com esta lista, o catalogo ja sabe quem tem foto antes
   de desenhar — e por isso consegue mostrar primeiro os produtos com foto.
   ============================================================ */
"""
with open(os.path.join(os.path.dirname(pasta), "fotos-disponiveis.js"), "w", encoding="utf-8") as f:
    f.write(cab)
    f.write("const FOTOS_EXISTENTES = new Set(" + json.dumps(arqs, ensure_ascii=False, indent=2) + ");\n")
print(f"{len(arqs)} fotos listadas em fotos-disponiveis.js")
