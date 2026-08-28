# Paradius Home — Historial completo del chat

**Transcript:** [Diagnóstico y home v7](d7b5d690-b66b-412b-8302-7bcb9675a41a)  
**Periodo:** 19 jul 2026 → 23 jul 2026 (iteración intensa) + follow-up 27 ago 2026  
**Repo:** `paradius_workspace/paradius-site`  
**Mockup actual:** `/mockups/home-v7`  
**Archivos clave:**
- `src/pages/mockups/home-v7.astro`
- `src/scripts/home-v7.ts`
- Dev: `http://localhost:4321/mockups/home-v7`

---

## 1. Resumen ejecutivo

Este chat empezó como frustración con el home de Paradius (“no logro mi visión”) y terminó como una iteración larga de **gramática visual + scroll invertido + animación de ramas** sobre el mockup **Home v7**.

La visión estabilizada:

> El home no es una landing que se scrollea: es un **ascenso**. El visitante aterriza en las raíces (hero). En desktop, rueda abajo = **subir** por un árbol de circuito. El contenido sale como **ramas** desde un **eje central invisible**, en zigzag (1 nodo por fila), alineado al tronco. El árbol es complementario, no bloqueante. La animación debe sentirse como **ramas creciendo** (diagonal ascendente desde el spine), no como wipes de PowerPoint ni deslizamientos horizontales.

El estado al cierre de la iteración de animación (23 jul): el settle sigue sin cerrar del todo la sensación de “rama creciendo”. El último cambio dejó un `translate3d` diagonal con Y dominante (sin rotate), tras rechazar hinge inferior (se veía horizontal) y rotate+counter-rotate (misma dirección / inclinaba texto / pelea con scroll).

---

## 2. Línea de tiempo

### Fase A — Diagnóstico y “high mind” (19 jul)

1. **Pedido inicial:** frustración con Astro/TS y con la IA; pedir subagentes Composer para contexto + live doc del estado real del sitio.
2. **Auditorías en paralelo:** arquitectura, contenido, calidad de código, visión/historial git.
3. **Conclusión honesta:** la capa de datos/SEO/TS está sólida; el dolor real es la **experiencia del home** (motor de scroll, espacios muertos, árbol arbitrario).
4. **Modo de trabajo acordado:** mente de alto nivel en el chat caro + Composer para trabajo de campo, para no saturar contexto.
5. **Lectura de la idea del home:** ascensión ritual, scroll invertido, estaciones a izquierda/derecha del tronco, árbol que se ilumina.

### Fase B — Evidencia visual y home-v3 (19–20 jul)

1. Screenshots del dueño: viewports vacíos (“Nothing?”), secciones que llegan tarde, layout que no siente el árbol.
2. **Diagnóstico de causa raíz:** el motor paginado (sistema de 7 puntos / páginas de 1 viewport) genera huecos matemáticos; el árbol SVG estático no correlaciona rama↔texto.
3. Se construye **`/mockups/home-v3`**: scroll nativo, árbol en parallax, secciones encadenadas, sin tocar el home de producción.
4. Fixes de layout en Selection/Practice/Velocity; listado completo del contenido del mockup en orden lógico.

### Fase C — La imagen del árbol denso cambia el modelo (20–21 jul)

1. El dueño sube una referencia donde **la página ES el árbol**: contenido incrustado entre ramas, no rieles junto a un tronco fino.
2. Corrección importante del dueño:
   - El scroll invertido en desktop **se queda** (sorpresa deliberada: intentás bajar y la página asciende).
   - Work/Talent en la copa entran **desfasados**, no simétricos.
   - El árbol es **complementario, no bloqueante** para el reveal del texto.
3. Llega copy largo real (engine / recruitment / operating model) — el sitio por fin tiene densidad narrativa B2B.
4. Decisiones de voz: **anónimo**, **3ª persona**, enmarcar y despachar agentes → nace **home-v4**.

### Fase D — Gramática del spine (22 jul)

A partir de un esquema con línea roja central, se fija la gramática:

| Regla | Definición |
|--------|------------|
| Espina invisible | No hay línea dibujada; el eje se percibe porque todo nace del mismo centro |
| Zigzag estricto | 1 nodo por fila: izq, aire, der, aire… (no grilla 1\|2 / 3\|4) |
| Alineación al tronco | Izquierda: `text-align: right`; derecha: `text-align: left` |
| Ascenso real | Aterrizaje en raíces (abajo del documento visual); scroll = subir |
| Copa | Arriba se relaja el zigzag (Work + Talent) |
| Sin cards decorativas | Nodos/paneles que salen del tronco, no cajas de dashboard |
| Contenido atomizado | Pilares/steps = una rama cada uno, no bloques gigantes |

Se itera brainstorm visual del mapa de nodos (Hero → Conviction → Engine → Selection → Ops → Assurance → Copa).

### Fase E — Mockups v5 / v6 / llegada a v7

Se suceden prototipos hasta **home-v7**, que concentra:

- Markup zigzag con spine grid
- Copy completo estilo v4 (sin eyebrows)
- Scroll desktop invertido (`scaleY(-1)` + wheel hijack)
- Árbol en parallax/opacidad
- Reveal por “axis settle” (bloques emergen del spine con el scroll)

URL de trabajo: `/mockups/home-v7`.

### Fase F — Pulido de layout v7 (23 jul, mañana)

Problemas resueltos (fuera de la pelea fina de diagonal):

1. **Mobile / resize roto** — settle con opacidades inline + márgenes; fix: settle solo en desktop hijack, `syncScrollListeners`, `revealAll` al salir de mobile.
2. **“Siempre en mobile”** — `revealAll` atado a `!hijack` (incluía coarse pointer); mobile = solo `max-width: 768px`.
3. **Philosophy** — unificado en `row--split` (cita izq + “Architecture Begins With People” der). Intento de misma columna revertido (feo).
4. **Spacing / asimetría** — gutters fluidos; `--branch-push` / `--content-span` por `depth-1/2/3`.

### Fase G — Guerra de la animación diagonal (23 jul, tarde)

Esta es la fase más densa del chat. Objetivo: **diagonal axis settle** que se sienta como rama creciendo, con scroll invertido.

---

## 3. Visión acordada (contrato de producto)

### Experiencia

1. Aterrizaje en **hero / raíces**.
2. Desktop: wheel down → **ascender** (scrollY baja vía hijack; `inverted-scroll` con `scaleY(-1)`).
3. Contenido en **zigzag** desde eje invisible.
4. Animación: bloques **salen del tronco** hacia su pose de reposo (construcción), y se retraen al volver.
5. Árbol: capa estética (opacidad/parallax), no dicta el timing del texto.
6. Mobile: scroll natural, sin hijack, clips visibles sin settle.

### Qué NO queremos (rechazos explícitos)

- Wipes tipo PowerPoint / clip-path cortinas / stagger one-shot
- Stretch `scaleX` desde el eje
- Inclinar el texto visible (rotate sin contra-rotación aceptable)
- Banda horizontal de todos los clips a la vez
- Cards/dashboard en el hero
- Correlación obligatoria path-SVG ↔ nodo de texto
- Medir progreso en coordenadas de documento **sin** el flip visual

---

## 4. Arquitectura técnica actual (v7)

### Scroll invertido

```css
.inverted-scroll { transform: scaleY(-1); }
.inverted-scroll > * { transform: scaleY(-1); }
```

- Hijack de `wheel` / teclado en desktop fino.
- `target -= deltaY` → wheel down disminuye `scrollY` → ascenso visual.
- Landing: medir hero y setear `scrollY` alto (raíces).
- Árbol: `progress = 1 - scrollY/maxScroll` en hijack.

### Settle / reveal

Archivo: `src/scripts/home-v7.ts`

Conceptos:

- Cada `.home-v7__clip` es un `RevealTarget` (`left` | `right` | `center`).
- `build` ∈ [0,1]: 0 = colapsado hacia spine; 1 = pose final.
- `rest = 1 - build`.
- Progreso actual: anclado a **`rect.top` visual** (los bloques entran por arriba y bajan a la zona de lectura con el scroll invertido).
- Opacidad con delay (`OPACITY_DELAY`) para que el fade no spoilee el movimiento.
- Split rows: nudge de fase en el clip derecho (`SETTLE_SIDE_NUDGE`).

Constantes al último estado conocido:

| Constante | Valor | Rol |
|-----------|-------|-----|
| `SETTLE_TOP_START` | `-0.08` | Empieza al asomar por arriba |
| `SETTLE_TOP_END` | `0.52` | Completo hacia mitad de viewport |
| `SETTLE_SIDE_NUDGE` | `0.1` | Desfase der en split |
| `OPACITY_DELAY` | `0.4` | Fade más tarde que el motion |
| `BRANCH_PULL_X_VH` | `0.07` | Pull horizontal hacia spine |
| `BRANCH_PULL_Y_VH` | `0.16` | Pull vertical (Y domina → diagonal ascendente) |

Transform actual:

```ts
translate3d(x, y, 0)  // sin rotate
// left:  x = +rest * pullX
// right: x = -rest * pullX
// y = +rest * pullY  → colapsado más abajo → emerge hacia arriba
```

Medición:

- `readVisualRect`: limpia solo transforms del settle, **mantiene** `inverted-scroll` (coordenadas visuales reales).
- Evita el bug de anclas en document-space sin flip (cards que “desaparecían” al subir).

---

## 5. Iteraciones de animación (catálogo de intentos)

Orden aproximado; cada una fue feedback visual del dueño.

| # | Enfoque | Resultado percibido | Veredicto |
|---|---------|---------------------|-----------|
| 1 | Clip-path / cortinas / plays temporizados | PowerPoint | Rechazado |
| 2 | `scaleX` crush al spine | Stretch feo | Rechazado |
| 3 | Translate diagonal simple (`AXIS_PULL` + `AXIS_PULL_Y`) | “Lo viejo” — base buena | Aceptado como base, luego se pidió invertir progreso |
| 4 | Peak / scrollDir hacks | Frágil | Rechazado |
| 5 | “Lo viejo pero al revés” (solo invertir fórmula de progreso) | Momento de claridad (“Bien. Ya le entendimos”) | Hito |
| 6 | Rotate + scale desde spine | Diagonal legible pero **inclina** el texto | Rechazado (“no es desplazamiento, es inclinar la forma”) |
| 7 | `rotate(θ) translateX` + contra-rotate hijos | Misma dirección en todos / no se lee como bloque entero | Parcial |
| 8 | Signo espejado L/R + wrapper `.home-v7__clip-inner` | Direcciones espejadas OK; flicker por feedback de rects | Flicker fix con anclas / luego visual rect |
| 9 | Negar Y por “scroll invertido” | Sentido igual (sigue mal) | Falló |
| 10 | Progreso por `bottom` | Diagonal top→bottom; copa no termina | Falló |
| 11 | Anclas sin flip + `anchor - scrollY` | Al subir, cards se ocultan; arriba vacío | Falló grave |
| 12 | Visual rect + progreso por `bottom` (sube) | Se veían **yendo**, no apareciendo | Invertido |
| 13 | Progreso por `top` (entran arriba, bajan) | Aparecen al entrar | Mejor sync scroll |
| 14 | `transform-origin: bottom` + rotate→translate | Arco casi **horizontal** | Rechazado |
| 15 | Solo `translate3d` con Y > X | Último estado: diagonal ascendente sin tilt | Pendiente de validación fina |

### Lecciones técnicas duras

1. **Con scroll invertido, medir en coordenadas visuales** (`getBoundingClientRect` con flip ON). Document-space sin flip miente.
2. **No alimentar el progreso con el mismo rect ya transformado** → feedback loop / flicker.
3. **Entrada visual al ascender:** los bloques entran por **arriba** y descienden a la zona de lectura. Progreso debe subir con `rect.top` creciente. Si usás `bottom` “como si subieran”, se ven yéndose.
4. **Hinge en `bottom` + rotate ≈ wipe horizontal** (arco cerca del pivote).
5. **`translateY` pelea con el scroll** si ambos van en el mismo eje percibido; la diagonal tiene que ser lo bastante vertical (Y > X) para leerse.
6. **Rotate visible en el copy** está vetado; contra-rotate complica y a menudo no vale la pena si el translate diagonal ya comunica “rama”.
7. **Copa / fin de ascenso:** hay que forzar o completar settle cerca de `scrollY → 0`, o las últimas hojas no “salen”.

---

## 6. Bugs de layout/reveal ya cerrados

| Bug | Causa | Fix |
|-----|-------|-----|
| Mobile roto al resize | Inline opacity + listeners | `syncScrollListeners`, settle solo desktop layout |
| Todo se veía “mobile” | `!hijack` incluía coarse pointer | Mobile = solo breakpoint |
| Philosophy feo en 1 columna | Stack forzado | Volver a split cita\|título |
| Flicker constante | Progress leía rect transformado / visibility toggle | Visual rect estable; sin hide/show agresivo |
| Cards desaparecen al subir | Anclas document-space sin flip | `readVisualRect` con inverted ON |
| Misma dirección L→R en todas las ramas | `translateX(+d)` en ambos lados | `branchSign` espejado |
| Últimas hojas no salen | Ventana de settle + ancla top exigente | End más bajo / boost near canopy (iterado) |

---

## 7. Estructura de contenido v7 (mapa de nodos)

Orden de lectura al **ascender** desde el hero:

1. **Hero (raíces, centro)** — lockup “Architecting the Dawn from Within” + CTAs  
2. **Philosophy (split)** — cita izquierda + “Architecture Begins With People” derecha  
3. **The Engine (izq)** — tesis  
4. **4 pilares alternados** — Surgical recruitment, Distributed operating model, Guardrails & observability, Built to scale  
5. **CTA engine (der)** — “Read the full operating model”  
6. **Selection intro + steps zigzag**  
7. **Ops blocks**  
8. **Assurance (center / injerto)** — métricas  
9. **Copa** — See our work (der) + Browse our talent (izq), desfasados  

Depths (`depth-1/2/3`) varían distancia al spine / al borde.

---

## 8. Estado al final de la sesión de animación

### Qué está bien

- Gramática de layout (spine invisible, zigzag, alineación).
- Scroll invertido + hijack + árbol.
- Mobile path separado.
- Copy denso y atomizado en ramas.
- Medición visual (no document-space ciego).
- Progreso por entrada desde arriba (ya no “se van” de forma obvia por fórmula invertida).

### Qué sigue abierto / insatisfactorio

- La animación **aún no cierra** la metáfora “rama creciendo” de forma inequívoca.
- Último intento: diagonal por `translate3d` (Y dominante, sin rotate). Falta confirmación del dueño.
- Tensión permanente:
  - demasiado X → wipe horizontal  
  - demasiado rotate desde bottom → arco horizontal  
  - rotate libre → texto inclinado  
  - Y vs scroll → pelea de ejes  
  - opacity delay vs spoiler vs “no se ve el motion”

### Posibles siguientes experimentos (no implementados como decisión final)

1. Easing distinto (motion primero, fade después) con curva no lineal en Y.  
2. `clip-path` inset desde el borde del spine (sin wipe full-card) solo como máscara de “salida del tronco”.  
3. Separar “frame de rama” (motion) de “inner copy” (fade) con timing distinto.  
4. Anclar progreso a una línea de lectura fija (ej. 40vh) con `IntersectionObserver` thresholds, no solo top/bottom.  
5. Reducir pelea scroll↔Y usando solo componente X + escala sutil desde spine (si el dueño acepta scale muy leve).

---

## 9. Archivos y superficie de cambio

| Path | Rol |
|------|-----|
| `src/pages/mockups/home-v7.astro` | Markup zigzag, CSS spine/depth/mobile, origins |
| `src/scripts/home-v7.ts` | Hijack, tree, settle, reveals |
| `src/styles/global.css` | `.inverted-scroll` (`scaleY(-1)`) |
| Mockups previos | `home-v3` … `home-v6` (historial de prototipos) |
| Producción `/` | Aún en motor viejo (`page-engine.ts`); v7 es mockup |

---

## 10. Glosario del proyecto (este chat)

| Término | Significado |
|---------|-------------|
| Spine / eje | Centro invisible vertical (~50vw) |
| Rama / branch / nodo | Un bloque de contenido que “sale” del spine |
| Zigzag | Alternancia 1 por fila |
| Settle / axis settle | Animación continua con scroll: colapsado→pose |
| Build / rest | `build` = progreso 0→1; `rest = 1-build` |
| Hijack | Wheel/teclado controlan `scrollY` lerp-eado |
| Inverted scroll | CSS flip + hijack; wheel down = ascender |
| Copa | Zona final (Work/Talent) |
| Spoiler | Ver el bloque antes de que “nazca” del spine |

---

## 11. Preferencias de trabajo del dueño (extraídas del chat)

- Respuestas en **español**; código/comentarios en **inglés**.
- High-mind + subagentes Composer para ejecución.
- No commits salvo pedido explícito.
- No `.md` ni ejemplos salvo que los pida (**este archivo es excepción pedida**).
- Iterar con screenshots; el feedback visual manda sobre la teoría.
- DRY/CLEAN/SOLID; artefactos reutilizables.
- Comandos de consola async con sleep (regla del entorno).

---

## 12. Cierre

El chat construyó, desde un diagnóstico de sitio frustrado, una **gramática visual clara** y un mockup v7 funcional en layout/scroll. La frontera abierta es **una sola**: sincronizar percepción de “rama que crece en diagonal ascendente” con la geometría real del scroll invertido, sin spoiler, sin flicker, sin inclinar texto, y sin que la copa se quede a medias.

Cualquier sesión nueva debería empezar leyendo:

1. Este historial  
2. `home-v7.ts` (constantes + `applyBranchTransform` + `settleProgress`)  
3. Las reglas de spine en `home-v7.astro`  
4. El último feedback del dueño sobre horizontal vs diagonal vs “se van / aparecen”

---

*Documento generado a pedido del dueño como resumen histórico del chat. No es un plan de implementación; es memoria de progreso.*
