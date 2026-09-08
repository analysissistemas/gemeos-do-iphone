import os, json
pasta = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fotos")

# Percorre fotos/ e as subpastas (motos/, loja/), porque cada linha da loja tem
# a sua. O nome guardado e relativo a fotos/ — "motos/t1.webp" — que e
# exatamente o que fotoDe() procura depois de tirar o prefixo "fotos/".
# Pastas com _ na frente sao arquivo morto (ex.: _apple, do sistema antigo de
# celular) e nao entram.
todos = []
for raiz, dirs, arquivos in os.walk(pasta):
    dirs[:] = [d for d in dirs if not d.startswith("_")]
    for f in arquivos:
        if f.lower().endswith((".webp", ".png", ".jpg", ".jpeg")):
            rel = os.path.relpath(os.path.join(raiz, f), pasta).replace(os.sep, "/")
            todos.append(rel)
todos.sort()

webps = {os.path.splitext(f)[0] for f in todos if f.lower().endswith(".webp")}
# Um PNG que ja tem .webp gemeo NAO entra na lista: ele fica so nesta maquina
# (esta no .gitignore), entao lista-lo faria o site procurar, depois de clonar,
# um arquivo que nao existe — e cair no contorno sem necessidade.
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
