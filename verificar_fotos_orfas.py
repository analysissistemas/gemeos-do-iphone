"""
Confere se sobrou alguma foto "orfa" no Storage do Supabase -- um arquivo
nomeado pelo ID da peca fisica (esquema antigo), em vez de modelo+cor
(esquema atual, ver chaveFotoLoja() em estoque.js).

Por que isso existe: em 21/08/2026 uma migracao de esquema de nome (commit
"Foto da loja passa a ser por modelo+cor, nao por peca fisica") tratou so 3
fotos manualmente e esqueceu outras 19, que ficaram invisiveis pro site
mesmo com o arquivo intacto no Storage -- o codigo novo so procura pelo
nome novo. Rode este script sempre que mexer de novo no esquema de nome de
foto, ou sempre que aparecer foto faltando sem explicacao.

Rodar (so mostra o que encontrou, nao muda nada):
    python verificar_fotos_orfas.py

Rodar e corrigir de verdade (baixa a foto antiga e resobe com o nome certo,
pelo mesmo caminho publico que o painel usa -- api/foto.js):
    python verificar_fotos_orfas.py --fix
"""
import base64
import json
import re
import sys
import unicodedata
import urllib.request

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

SUPABASE_URL = "https://bzeceniidapsjvaudwwb.supabase.co"
ANON_KEY = "sb_publishable_57Nhaiq5oNiuCd5MezKpxw_gn80rCja"
BUCKET = "produtos-fotos"
API_FOTO = "https://gemeos-do-iphone.vercel.app/api/foto"

UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$", re.I)


def _get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req) as r:
        return r.read()


def _post_json(url, body, headers=None):
    data = json.dumps(body).encode("utf-8")
    h = {"Content-Type": "application/json"}
    h.update(headers or {})
    req = urllib.request.Request(url, data=data, headers=h, method="POST")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode("utf-8"))


# mesma normalizacao de vitrine.html/estoque.js -- precisa bater igualzinho,
# senao o site continua sem achar a foto mesmo com o arquivo certo.
def sem_acento(s):
    s = unicodedata.normalize("NFD", s or "")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def cor_sem_traducao(cor):
    return re.sub(r"\s*\([^)]*\)\s*$", "", cor or "").strip()


def chave_foto_loja(modelo, cor):
    m = sem_acento(modelo)
    c = sem_acento(cor_sem_traducao(cor))
    return f"{m}-{c}" if c else m


def listar_bucket():
    body = json.dumps({"prefix": "", "limit": 1000}).encode("utf-8")
    req = urllib.request.Request(
        f"{SUPABASE_URL}/storage/v1/object/list/{BUCKET}",
        data=body,
        headers={"apikey": ANON_KEY, "Authorization": f"Bearer {ANON_KEY}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode("utf-8"))


def buscar_produto(pid):
    url = (
        f"{SUPABASE_URL}/rest/v1/produtos?id=eq.{pid}"
        f"&select=id,cor,modelos(marca,modelo)"
    )
    dados = json.loads(_get(url, {"apikey": ANON_KEY, "Authorization": f"Bearer {ANON_KEY}"}))
    return dados[0] if dados else None


def main():
    fix = "--fix" in sys.argv
    arquivos = listar_bucket()
    orfas = [o["name"] for o in arquivos if UUID_RE.match(o["name"])]

    if not orfas:
        print("Nenhuma foto orfa encontrada -- todos os nomes ja estao no esquema modelo+cor.")
        return

    print(f"{len(orfas)} foto(s) com nome de ID antigo (orfas):\n")
    pendentes = []
    for nome in orfas:
        pid = nome[:-4]  # tira ".jpg"
        prod = buscar_produto(pid)
        if not prod:
            print(f"  {nome}  -> produto {pid} nao existe mais no banco (peca vendida/apagada?). Ignorando.")
            continue
        marca = (prod.get("modelos") or {}).get("marca") or ""
        modelo = (prod.get("modelos") or {}).get("modelo") or ""
        nome_completo = modelo if marca == "Apple" or not marca else f"{marca} {modelo}"
        chave_nova = chave_foto_loja(nome_completo, prod.get("cor") or "")
        print(f"  {nome}  ->  {chave_nova}.jpg   ({nome_completo}, {prod.get('cor')})")
        pendentes.append((nome, chave_nova))

    if not pendentes:
        return

    if not fix:
        print(f"\nModo so-leitura. Rode com --fix pra baixar e re-subir essas {len(pendentes)} foto(s) com o nome certo.")
        return

    print(f"\nCorrigindo {len(pendentes)} foto(s)...\n")
    for nome, chave_nova in pendentes:
        conteudo = _get(f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{nome}")
        b64 = base64.b64encode(conteudo).decode("ascii")
        resp = _post_json(API_FOTO, {"chave": chave_nova, "imagem_base64": f"data:image/jpeg;base64,{b64}"})
        if not resp.get("ok"):
            print(f"  {nome} -> {chave_nova}.jpg  [FALHOU: {resp}] -- mantendo o arquivo antigo")
            continue
        pid = nome[:-4]
        _post_json(API_FOTO, {"chave": pid, "remover": True})
        print(f"  {nome} -> {chave_nova}.jpg  [OK, arquivo antigo apagado]")

    print("\nPronto.")


if __name__ == "__main__":
    main()
