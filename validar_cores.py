def lin(c):
    c = c/255
    return c/12.92 if c <= 0.03928 else ((c+0.055)/1.055)**2.4
def L(h):
    h = h.lstrip("#")
    r,g,b = (int(h[i:i+2],16) for i in (0,2,4))
    return 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b)
def cr(a,b):
    la,lb = L(a),L(b)
    hi,lo = max(la,lb),min(la,lb)
    return (hi+0.05)/(lo+0.05)

SURF = "#141414"   # superficie dos graficos
PAGE = "#000000"

print("=== TEXTO sobre superficie", SURF, "(minimo 4.5 corpo / 3.0 grande) ===")
for nome,h in [("ink primario","#f5f5f7"),("ink secundario","#a1a1a6"),("ink muted","#6e6e73")]:
    print(f"  {nome:16} {h}  {cr(h,SURF):5.2f}:1")

print()
print("=== STATUS sobre", SURF, "(minimo 3.0) ===")
for nome,h in [("good","#0ca30c"),("warning","#fab219"),("serious","#ec835a"),("critical","#d03b3b")]:
    v = cr(h,SURF); print(f"  {nome:9} {h}  {v:5.2f}:1  {'OK' if v>=3 else 'FALHA'}")

print()
print("=== RAMPA MONOCROMATICA do funil sobre", SURF, "(ordinal: minimo 2.0) ===")
rampa = ["#f5f5f7","#d2d2d7","#aeaeb2","#8e8e93","#6e6e73","#48484a"]
for h in rampa:
    v = cr(h,SURF); print(f"  {h}  {v:5.2f}:1  {'OK' if v>=2 else 'FALHA'}")
