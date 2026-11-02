# Prompts para Gemini (Nano Banana) · Pájaro del Parque Andino Juncal

Cómo usarlos:
- Adjunta siempre `assets/logo-juncal-blanco.png` como imagen de referencia. Es blanco sobre transparente; si Gemini no lo ve bien, ponlo antes sobre un fondo oscuro.
- Los prompts van en inglés porque el modelo los sigue con más precisión. Debajo de cada uno hay una explicación en español.
- Pide **una sola imagen con todos los fotogramas** (prompt 2). Si los pides por separado, cada dibujo sale con un pájaro distinto.
- Después: vectoriza el resultado (Illustrator → Calco de imagen, o vectorizer.ai), exporta cada fotograma como SVG y reemplaza los dibujos en `assets/ave-juncal.js`.

---

## 1. Pájaro posado (refresh del símbolo)

```
Redraw the bird from the attached logo as a clean, modern flat vector silhouette.
Species: Diademed Sandpiper-Plover (Phegornis mitchellii), a small high-Andean wetland shorebird:
compact rounded body, short tail, thin slightly down-curved bill, short legs.
Keep the same perched pose and proportions as the original logo bird, facing right, standing on one visible leg.
Style: solid pure black (#000000) silhouette on pure white background, no eye, no outlines, no inner lines,
no texture, no shading, no text. Smooth confident curves, minimal geometric logo mark, readable at 24px.
Centered, generous margins, square 1:1 image.
```

Pide el mismo pájaro del logo, redibujado limpio como silueta negra sobre fondo blanco, sin ojo ni detalles, en la misma pose. Sirve como base del refresh del logo.

---

## 2. Hoja de fotogramas (la animación)

```
Create a sprite sheet for a frame-by-frame flight animation of the same bird
(Diademed Sandpiper-Plover, small Andean shorebird, compact body, thin slightly down-curved bill, short tail),
matching the attached logo bird. Side view, facing right in every frame.

One single image, 4 columns x 2 rows grid, 8 frames, every frame the same bird at exactly the same size,
evenly spaced, each bird centered in its cell:
1. perched, wings folded (like the logo)
2. crouching, ready to take off
3. still standing, both wings raised high above the back
4. flying, wings fully up in a V
5. flying, wings half up
6. flying, wings level, gliding
7. flying, wings half down
8. flying, wings fully down, legs tucked

Style: solid pure black (#000000) flat silhouettes on pure white background, like classic flying-bird silhouette clipart.
No eye, no outlines, no feather detail, no shadows, no gradients, no ground line, no numbers, no text, no grid lines.
Consistent body shape across all frames, only the wings and posture change. Wide 2:1 image.
```

Pide los 8 dibujos en una sola imagen, en el mismo orden que usa la animación: posado, se agacha, alas arriba y 5 posiciones de vuelo. Así el pájaro sale igual en todos.

---

## 3. Corrección (si sale inconsistente)

```
Keep exactly the same bird design, but make all 8 frames the same size and body shape.
Only the wings should change between frames. Pure black silhouettes, white background, no extra elements.
```

Úsalo como segundo mensaje si los pájaros salen de distinto tamaño o forma.

---

## 4. Logo completo con tipografía nueva (opcional)

```
Using the redrawn bird silhouette, design a refreshed horizontal logo for "Parque Andino Juncal",
a private protected area and Ramsar wetland in the Chilean Andes.
Bird mark on the left, name on the right in two lines: "Parque Andino" / "Juncal".
Typography: elegant contemporary serif or refined humanist sans, generous letter spacing, calm and natural.
Flat, single color: black on white. No mountains, no extra icons, no tagline, no effects.
Clean vector style, wide 3:1 image.
```

Esto es para explorar cómo se vería el logo con una tipografía actualizada. Es solo una propuesta para mostrarles a los clientes.

---

**Por confirmar en la reunión:** la especie (supusimos chorlito cordillerano) y los archivos originales del logo. Si la especie es otra, cambia la línea `Species:` en los prompts.
