from PIL import Image
Image.MAX_IMAGE_PIXELS = None

# ---- logo preta, a partir do mesmo recorte ----
im = Image.open(r"C:\Users\Pichau\gemeos-do-iphone\_ref\pag01.png").convert("RGB")
c = im.crop((1108, 5765, 1520, 5900))
c = c.resize((c.width*3, c.height*3), Image.LANCZOS)
rgba = c.convert("RGBA"); px = rgba.load(); w, h = rgba.size
for y in range(h):
    for x in range(w):
        r, g, b, _ = px[x, y]
        lum = (0.2126*r + 0.7152*g + 0.0722*b) / 255
        a = min(1.0, max(0.0, (lum - 0.30) / 0.55)) ** 0.85
        px[x, y] = (17, 17, 19, int(a*255))     # #111113
rgba.save(r"C:\Users\Pichau\gemeos-do-iphone\logo-gemeos-preta.png")
print("logo-gemeos-preta.png gerada", rgba.size)

# ---- contraste no tema claro ----
def lin(c):
    c = c/255
    return c/12.92 if c <= 0.03928 else ((c+0.055)/1.055)**2.4
def L(h):
    h = h.lstrip("#"); r,g,b = (int(h[i:i+2],16) for i in (0,2,4))
    return 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b)
def cr(a,b):
    la,lb = L(a),L(b); hi,lo = max(la,lb),min(la,lb)
    return (hi+0.05)/(lo+0.05)

SURF = "#ffffff"
print(f"\n=== TEMA CLARO — superficie {SURF} ===")
print("TEXTO (corpo >=4.5 / grande >=3.0)")
for nome,h in [("ink primario","#1d1d1f"),("ink secundario","#515154"),("ink muted","#6e6e73")]:
    v = cr(h,SURF); print(f"  {nome:16} {h}  {v:5.2f}:1  {'OK' if v>=4.5 else 'so p/ texto grande' if v>=3 else 'FALHA'}")

print("\nSTATUS (>=3.0 ideal; abaixo disso depende do rotulo escrito)")
for nome,h in [("good","#0a7d0a"),("warning","#a06800"),("serious","#b8531f"),("critical","#c02626")]:
    v = cr(h,SURF); print(f"  {nome:9} {h}  {v:5.2f}:1  {'OK' if v>=3 else 'FALHA'}")

print("\nRAMPA ORDINAL do funil/rosca (>=2.0 para a mais clara)")
for h in ["#1d1d1f","#48484a","#6e6e73","#8e8e93","#aeaeb2","#c7c7cc"]:
    v = cr(h,SURF); print(f"  {h}  {v:5.2f}:1  {'OK' if v>=2 else 'FALHA - clara demais'}")
