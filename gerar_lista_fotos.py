import os, json
pasta = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fotos")
arqs = sorted(f for f in os.listdir(pasta) if f.lower().endswith((".png",".jpg")))
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
