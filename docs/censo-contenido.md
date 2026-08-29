# Censo de contenido: paradius.dev (2026-08-27)

Documento de trabajo: inventario completo de TODO el texto que Paradius ha tenido, tiene o planeó tener. No es un resumen. Cada línea de copy está citada verbatim en su idioma original (inglés casi siempre, español donde el dueño dictó). La prosa de este censo está en español y no usa em-dash ni en-dash; las citas verbatim se respetan tal cual, incluidos sus guiones.

Fuentes censadas: repo `paradius-site` (12 commits, incluye mockups home-v3 a home-v7 y `engine.astro`), repo `landing_page` (6 commits, landing pre-Astro), `PRODUCT.md`, `docs/home-v7-historial-chat.md`, `doc/` y `doc/plans/` del workspace, fixtures `cases.json` y `profiles.json`, y el transcript de la sesión de diseño (1707 líneas JSONL).

Convención de estado usada en todo el documento:

| Estado | Significado |
|---|---|
| **VIGENTE-PROD** | Está hoy en el sitio desplegado (`src/pages/index.astro` y componentes) |
| **CANON-v3** | Aprobado en `PRODUCT.md` (libreto v3) pero NO implementado en producción |
| **DESCARTADO** | Existió, ya no se usa, murió por iteración normal |
| **RECHAZADO** | El dueño lo mató explícitamente, con cita del rechazo |
| **DEUDA** | Está vivo en el código pero contradice el canon; hay que reescribirlo |
| **PLANEADO** | Solo existe en documentos de plan, nunca se escribió el copy final |

---

## 1. Línea de tiempo del contenido

Cuatro eras, cada una con un mensaje central distinto. La era 2 es lo que se sirve hoy; la era 4 es lo aprobado pero no portado.

### Era 0: Landing pre-Astro v1.0 (`landing_page`, commit `4768f66`, 2026-02-15)

Mensaje central: **la ingeniería como acto de fe**. Una sola página, tres secciones, sin catálogo ni casos. El argumento era el bienestar del ingeniero como causa de la calidad.

- Hero subtítulo: `"Engineering as an act of faith. Quality as a consequence of conviction."`
- Sección Philosophy: `"An Act of Faith"`, abierta con la estadística `"Only one in four software engineers is happy in their current role."`
- Sección Expertise: `"What We Architect"`
- Contacto: solo un ancla `#contact` al footer, con `contact@paradius.dev`. No existía formulario, ni `/talent`, ni `/work`.

### Era 1: Landing pre-Astro, reescritura SEO (`landing_page`, commit `dbc3032`, mismo día)

Mensaje central: **consultoría de ingeniería de alta gama, architecture-first / engineer-first**. Es el giro de la voz "we" a la voz "Paradius" en tercera persona, motivado por SEO. Este texto es literalmente idéntico al HEAD actual de `landing_page` y es el que se portó 1:1 a Astro.

- Hero subtítulo: `"Engineering as an act of will. Beyond utility."` (cambia fe por voluntad; primera aparición del eje "will")
- `"What We Architect"` pasa a `"What Paradius Architects"`
- Aparece la dirección física, el LinkedIn, `solutions@paradius.dev`, el slogan JSON-LD `"Architecting the dawn from within"`, `priceRange: "$$$"`.
- Las tres tarjetas de Expertise (System Architecture / Cross-Platform Engineering / Technical Integrity) nacen acá y **nunca cambiaron una sola palabra hasta hoy**: son el bloque de copy más viejo y más estable de todo Paradius.

### Era 2: Astro S0 a S8 (`paradius-site`, commits `f6ef0d2` a `833dadb`, jul 2026). ESTO ES LO QUE ESTÁ EN PRODUCCIÓN HOY.

Mensaje central: **la arquitectura empieza por las personas, y podés comprar esas personas por perfil**. Se agrega el modelo comercial de staff augmentation encima de la filosofía.

- `4372496` (S1): port 1:1 de la landing a componentes Astro. Orden: Header, Hero, Philosophy, Expertise, TalentTeaser, WorkTeaser, Footer.
- `1796a05` (S2.5): siete mockups de aprobación (talent-a/b, profile-a/b, work, contact, index). Borrados luego en `0798e39`.
- `769b65b` a `72e7e7b` (S3 a S5): nacen `/talent`, `/talent/[code]`, `/work`, `/work/[slug]`, `/contact`.
- `833dadb` (18 jul, "wip"): la reescritura grande. Muere `"An Act of Faith"`, nace `"Architecture Begins With People"`; nacen `HowWeSelect` y `VelocityModule`; el hero cambia a `"Curated talent drafting the future's blueprint"` y el CTA primario pasa de `"Browse our talent"` a `"Browse the registry"`.
- **El home de producción no cambió una línea entre el 18 de julio y hoy.**

### Era 3: Mockups home-v3 a home-v6 y engine.astro (commit `5373758`, 27 ago, no en prod)

Mensaje central: **Paradius no es una agencia de staffing, es un motor de software distribuido**. Voz corporativa, mecánica, con jerga de sistema.

- v3: reordena la era 2 en un árbol ascendente. Copy idéntico a producción, solo con eyebrows numerados (`01 — CONVICTION`, etc.).
- v4: nace "THE ENGINE" y los cuatro pilares con jerga (`sniping pipeline · network nodes · deep profile evaluation`), la sección OPERATION y la franja ASSURANCE con `~100% developer retention`.
- v5: comprime todo a nodos de una línea.
- v6: vuelve a los pilares completos de v4; es experimento de layout, no de copy.
- `engine.astro`: la página de detalle del modelo operativo, con el copy corporativo más largo y más específico que existe (limitaciones regionales, bonos por performance, Fortune 500).

### Era 4: Libreto v3 / home-v7 (`PRODUCT.md`, 27 ago 2026). APROBADO, NO IMPLEMENTADO.

Mensaje central: **Paradius es un mito hecho empresa: Poder y Voluntad unidos, que desaparecen dentro del éxito del cliente**. Voz narrativa en primera persona plural, sin métricas, sin jerga, sin subtítulo comercial.

- Reemplaza, por su propio texto, `"all current home copy except the lockup"`.
- Mata la voz mono, mata las métricas inventadas, mata la franja de assurance, mata los eyebrows numerados.
- Deja vivo el lockup `"Architecting the Dawn from Within"` y exactamente dos CTAs.

Resumen de qué mensaje vendía cada era:

| Era | Mensaje en una línea | Estado |
|---|---|---|
| 0 | La gente feliz construye mejor software | DESCARTADA |
| 1 | Consultoría architecture-first, engineer-first | Vive solo en SEO/JSON-LD |
| 2 | Arquitectura empieza por las personas + comprá perfiles | VIGENTE-PROD |
| 3 | Somos un motor distribuido de alto rendimiento | DESCARTADA (salvo `engine.astro`, aún linkeada) |
| 4 | Poder y Voluntad; construimos el amanecer y desaparecemos | CANON-v3, sin implementar |

---

## 2. El canon vigente

### 2.1 El mito fundacional (dictado por Gabriel, transcript línea 713, verbatim, español sin corregir)

> 'En el principio no era nada. Un ser omnipotente se dividio en dos para evitar su soledad. Poder y voluntad, las dos fuerzas capaces de conseguir todo en el mundo. De estas dos mitades en su amor surgio el mundo. Estas dos mitades fueron heredadas por los hombres que eventualmente corrompieron todo y lo que eran dos pueblos se hicieron 4. Paradius (Poder Neutral) Nerdeus (voluntad neutral) Siegrain (Voluntad corurpta) Hellcrek (Poder corrupto).
>
> Paradius es la historia del elegido de Paradius (una de las N rencarnaciones) en su viaje rescata al mundo aunando las 4 razas dentro de si y luego sacrificando todo para perder su propia identidad y reunificar al mundo en una era de paz asumiendo el rol de soberano de las sombras.
>
> En resumen. Paradius es un sueno
>
> En la praxis. Paradius soy yo. La tenacidad de lograr crear un mundo mejor.
>
> Que tiene Paradius que ningun competidor pueda decir? Me tiene a mi. Un sobreviviente. Una persona incapaz de rendirse y siempre sonando y cumpliendo imposibles. Eso es lo que tiene
>
> Que lector me imagino? Pues la verdad. Es que me da lo mismo el lector. Hay que ser realista. No voy a conseguir ningun cliente por posicionamiento en redes ni busquedas. Eso hay N mil millones de agencias mucho mejores que yo. Como lo voy a conseguir. Escribiendo y contactando a empresas directamente.
>
> Lo que debe hacer mi pagina es imprentarse en la memoria de la gente. Algo que diga. Ok, interesante al menos. Al menos diferente.
>
> Y ademas honesto. yo no soy una persona politicamente correcta. Lo mas lejos de la verdad. Yo soy una persona con hambre, ambiciosa, sonadora. Mi emporesa y mis servicios no son las 20mil lineas de burocracia ni correctitud. Mi empresa es gente que voy a empujar para que logren lo mejor posible en todo lo que hagan.
>
> Cuanta extraneza tolera? Pues me da lo mismo la verdad cuanto tolere
>
> que si. que vea las palabras que busca. si que sea lo que es realmente la empresa que la gente no es adivina
>
> pero fundamentalmente. que la gente me recuerde..
>
> No se si te ayuda en algo lo que digo. Tal vez no es eso lo que buscas. Happy to answer any extra questions

Nota de censo: **Nerdeus, Siegrain y Hellcrek nunca entraron a `PRODUCT.md` ni a ningún copy público.** Solo Paradius y la dualidad Poder/Voluntad se trasladaron. Las tres razas restantes son material inédito disponible si alguna vez se quiere profundizar la mitología.

### 2.2 Definición de producto (PRODUCT.md, "What Paradius is", verbatim)

> A staff-augmentation consultancy that is, in truth, one survivor's refusal to give up, scaled into a company. Clients pick anonymous senior engineers (codes, not names) or ask for a full team. The company's myth: the world was made by two forces, Power and Will; Paradius unites them and then disappears into the client's success ("sovereign of shadows"). The myth is not decoration. It explains the product: anonymized engineers, no signature on the client's systems, the client keeps the glory.

### 2.3 El lector y el objetivo (PRODUCT.md, verbatim)

> Visitors do not arrive by search. They arrive because Gabriel wrote to them directly. The page has ONE job: to be remembered. "At least interesting. At least different." Honesty over political correctness, always. The buyer's search keywords (staff augmentation, nearshore, senior engineers) must exist on the page, but never as its voice.

### 2.4 EL LIBRETO v3 COMPLETO, VERBATIM, CON STAGING

Encabezado de la sección en `PRODUCT.md`: `"Staging notes in brackets. This copy replaces all current home copy except the lockup."`

---

**[ROOTS — landing. Near-total darkness. Lockup + CTAs, nothing else. No subtitle.]**

CTAs: **"Browse the registry"** / **"Start your team"** (one label per intent, reused verbatim everywhere).

---

**[NARRATIVE OPENER — first line of the ascent, center.]**

> "Nobody arrives at Paradius by accident."

---

**[THE CONFESSION — center, a full viewport of its own. Typographic peak 1.]**

> "You can find ten thousand agencies with better rankings, better funding, better manners. You will not find one that refuses to quit the way we do."

Nota de staging verbatim: `(Voice is "we", never "its founder". The line must assert superiority of will, never read as "worse but stubborn".)`

---

**[THE THESIS — first fork of the spine. Power falls left, Will falls right.]**

> "Before it was a company, Paradius was a story: a world made by two forces."

- LEFT (Power): *"Power: the architecture, the guardrails, the discipline that keeps systems from rotting."*
- RIGHT (Will): *"Will: the spark. People who cannot leave things worse than they found them."*
- CENTER (close): *"Every system that endures needs both. Most companies sell you one and call it engineering."*

---

**[THE ENGINE — trunk. Real mechanics, concrete images. No jargon strips.]**

- RIGHT (Will): *"We do not hire headcount. We find the ones with the spark and push them further than they believed they could go."*
- LEFT (Power): *"Every engagement begins in one room: our hub, a senior mentor at the next desk, standards enforced from day one."*
- LEFT (Power): *"Then they go remote. And nothing degrades, because the discipline travels with them."*
- RIGHT (Will): *"Nobody here is disposable. Almost nobody leaves."*
  [system footnote: `retention: ~100%`]

**DEUDA CONOCIDA**: ese `[system footnote: retention: ~100%]` sigue escrito en `PRODUCT.md` pero fue borrado del markup de `home-v7.astro` la noche del 27 ago, cuando el dueño prohibió la voz mono. `PRODUCT.md` está desactualizado en ese punto exacto. Hay que borrar la línea del documento.

---

**[THE PROOFS — branches. One Will line opens; two fruits in narrated system register. HINT the signature (things endure), NEVER state the "rescue" framing: naming what things were before humiliates the people who lived it. No invented metrics, ever.]**

> "We leave systems better than we found them. Then they stay that way."

- *"Warehouse automation: we built the visual language that lets robots, inventory and hundreds of services move as one. A Fortune 500 retailer now runs it across its network."*
- *"Banking infrastructure: payments stopped going missing. Delays became guarantees. Those systems are still standing, years later, untouched by us."*

---

**[THE CANOPY — the dawn. Both forces merge at center. Maximum light of the whole page. Typographic peak 2.]**

> "The dawn is not ours. It is yours.
> Our engineers carry codes instead of names. Your systems carry no signature of ours. We build the morning; you keep it.
> That is the whole story of Paradius, and it ends the same way every time: we disappear into your success."

Staging verbatim: `"Registry teaser LEFT (Power: the codes), Work teaser RIGHT (Will: what was achieved). CTAs reuse the two labels from the hero."`

---

### 2.5 Leyes de contenido (qué se puede decir y qué no)

**Text quality bar (PRODUCT.md, verbatim):**

- `"Zero em-dashes and en-dashes in visible copy. Restructure with periods, commas, colons."`
- `"No invented numbers, no fake precision, no jargon strips ("sniping pipeline · network nodes") as content."`
- `"Every line must be something no other agency could sign."`

**Ley de voz (PRODUCT.md + transcript):**

- Voz `"we"`, nunca `"its founder"`. La confesión debe afirmar superioridad de voluntad, nunca leerse como `"worse but stubborn"`.
- Regla derivada del rechazo de Gabriel (línea 826): la frase no puede sonar a `"somos una mierda pero no nos rendimos"`.

**Ley de las pruebas (hint, not state):**

- Verbatim del staging: `"HINT the signature (things endure), NEVER state the "rescue" framing: naming what things were before humiliates the people who lived it. No invented metrics, ever."`
- Origen verbatim (Gabriel, línea 730): `"el main point es como sistemas ahi medio parcheados se levantan a cosas que se sostienen en el tiempo. porque ese es mi sello yo doy el 300% para hacer cosas que no son para resolver (que tampoco quiero enfocarme mucho en eso) porque puede ser peligroso para la gente eso. pero hintearlo."`

**Ley de la voz mono (PRODUCT.md, "Typography rule", verbatim):**

> **The mono "system voice" is BANNED on the home** (owner decision 2026-08-27 night): no mono annotations, no `retention:` notes, no mono kickers or codes as decoration. Mono survives only where codes are real, functional data (/talent registry, /work case pages). The home speaks two voices at EQUAL hierarchy: Power (the voice) and Will (the melody) — two timbres of the same coin, same scale, never one big and one small. The lockup/logo remain the only stencil artifacts: drawn monuments, not fonts. Text faces are anonymous plumbing: cold, precise, with NO identity ambitions — identity lives in the lockup, the myth, and the light. Stencil as page typography is a CLOSED experiment (five fonts tried and rejected 2026-08-27).

**Ley de CTAs:** exactamente dos labels en todo el home, reusados verbatim: `"Browse the registry"` y `"Start your team"`. Un label por intención.

**Ley visual (PRODUCT.md, "Visual law", verbatim):**

- `"The lockup is sacred."` El lockup es `"Architecting the Dawn from Within"` (SVG, stencil circuit letterforms), centrado, con dawn-rise animation. `"It is the tuning fork: everything else must rise to its strangeness, never dilute it."`
- `"Centered manifesto hero."` Las reglas anti-centro de cualquier skill NO aplican.
- `"Inverted scroll is deliberate."` Desktop wheel-down = ascender un árbol de circuito de raíces a copa. `"Never "fix" it."`
- `"Invisible spine, zigzag branches."` Un nodo por fila. La columna izquierda alinea a la derecha, la derecha alinea a la izquierda.
- `"Dark theme only."` bg #000, surface #0a0a0a, divider #1a1a1a, text #fff / #9ca3af, accent #c0c8d4. `"No other hues. Light comes from the accent family, never from color."`

**Eje semántico Power | Will (PRODUCT.md, verbatim):**

- `"Left = Power"`: system, architecture, proof, numbers, discipline.
- `"Right = Will"`: people, the spark, manifesto statements.
- `"Center = the unified"`: hero, the assurance graft, the canopy (dawn), y declaraciones confesionales que no pertenecen a ningún lado.
- `"Never place a block by mechanical alternation. Which side a text appears on must tell the reader what kind of truth it is."`

**Regla tipográfica:** `"Typographic weight is proportional to what the line cost to say."` Los dos picos son la confesión y el dawn. `"When a line stands alone, the whole viewport belongs to it: no timid margins making the message a slave of the visual."`

**Ley de animación (PRODUCT.md, validada 2026-08-27, "do not regress"):**

1. `"Progress anchors on the LEADING edge (rect.bottom) — blocks are born the instant they enter the viewport."`
2. `"Growth radiates from the spine-bottom corner (transform-origin right/left/center bottom + subtle uniform scale 0.94→1)."`
3. `"Settle velocity must EXCEED scroll flow: BRANCH_PULL_Y_VH (0.55) > SETTLE_ENTRY_END (0.45), or the ascent cancels and reads horizontal."`
4. `"No artificial side phase (SETTLE_SIDE_NUDGE = 0): geometry orders births; whichever block hangs lower is born first."`
5. `"Canopy end is a smooth RAMP to completion (last 0.3vh of scroll), never a snap — a hard t = 1 made the final block jump mid-birth."`

Vetos de animación (no volver a proponer): `"PowerPoint wipes / clip-path curtains / one-shot staggers; scaleX stretch; visible text rotation; bottom-hinge rotate; document-space measurement without the visual flip; dashboard cards in the hero; forcing text timing to background-tree SVG paths."`

### 2.6 Contradicciones internas del canon, sin resolver

1. `"The semantic axis"` describe la voz de Power como `"mono (ui-monospace, tracking 0.08em) and restrained Inter"`, pero `"Typography rule"` (decisión posterior, misma fecha, de noche) banea el mono del home. Prevalece la segunda por orden cronológico explícito, pero el texto de la primera sigue ahí.
2. El footnote `retention: ~100%` sigue documentado en el libreto pese a estar prohibido y borrado del código.
3. `PRODUCT.md` usa em-dashes en su propia prosa interna mientras prohíbe em-dashes en copy visible. No es violación estricta (es documentación, no copy), pero conviene saberlo si se copia texto de ahí.
4. El libreto v3 no menciona Philosophy, los 4 pilares, Selection, Ops ni Assurance, que sí figuran en el mapa de nodos del historial de chat. No hay declaración explícita de si quedan eliminados o fuera de alcance. En la práctica el markup de home-v7 los eliminó.

---

## 3. Censo por sección del home

Cada subsección lista TODAS las versiones que existieron de ese bloque, en orden cronológico, con fuente y estado.

### 3.1 Hero / lockup

| # | Texto | Fuente | Estado |
|---|---|---|---|
| 1 | H1 sr-only: `"Architecting the dawn from within"` | landing v1.0 (`4768f66`) | DESCARTADO |
| 2 | H1 sr-only: `"Paradius — Architecting the Dawn from Within \| Software Engineering Consultancy"` | landing `dbc3032`, Astro S1, v3/v4/v5/v7 | VIGENTE-PROD |
| 3 | H1 sr-only sin sufijo: `"Paradius — Architecting the Dawn from Within"` | home-v6 únicamente | DESCARTADO (inconsistencia sin explicar) |
| 4 | alt de imagen v1.0: `alt=""` (decorativa) | landing v1.0 | DESCARTADO |
| 5 | alt actual: `"Paradius: Architecting the Dawn from Within"` | landing `dbc3032` en adelante, todas las versiones | VIGENTE-PROD y CANON-v3 |
| 6 | Lockup SVG: `"Architecting the Dawn from Within"` | todas las eras | **INTOCABLE** (`"The lockup is sacred"`) |

**Subtítulos del hero, todas las versiones:**

| # | Texto | Fuente | Estado |
|---|---|---|---|
| 1 | `"Engineering as an act of faith. Quality as a consequence of conviction."` | landing v1.0 | DESCARTADO |
| 2 | `"Engineering as an act of will. Beyond utility."` | landing `dbc3032` a HEAD de `landing_page` | DESCARTADO en Astro |
| 3 | `"Senior nearshore engineers, ready to present in 48 hours."` | Astro S1 (`4372496`) | DESCARTADO |
| 4 | `"Curated talent drafting the future's blueprint"` (marcado "D10" en el código) | `833dadb` a HOY, y mockups v3 a v6 | **VIGENTE-PROD, pero RECHAZADO por el canon v3** |
| 5 | `"Nobody arrives at Paradius by accident."` como subtítulo del hero | libreto v2 (transcript línea 726) | DESCARTADO como subtítulo (se movió fuera del hero) |
| 6 | Sin subtítulo | libreto v3 / home-v7 | **CANON-v3** |

Cita del rechazo (Gabriel, línea 826, punto 1, verbatim): `"Tal vez no necesitamos subtitulo del todo. Tal vez eso de que nadie llega a paradius por accidente es parte de la narrativa?"`

**CTAs del hero:**

| # | Texto | Fuente | Estado |
|---|---|---|---|
| 1 | `"Get in touch"` (ancla a `#contact`) | landing pre-Astro, todas sus versiones | DESCARTADO |
| 2 | `"Browse our talent"` → `/talent` + `"Start your team"` → `/contact` | Astro S1 | DESCARTADO el primero |
| 3 | `"Browse the registry"` → `/talent` + `"Start your team"` → `/contact` | `833dadb` a hoy, v3 a v7, libreto v3 | **VIGENTE-PROD y CANON-v3** |

### 3.2 Opener narrativo

Bloque que solo existe en la era 4.

| # | Texto | Fuente | Estado |
|---|---|---|---|
| 1 | `"Nobody arrives at Paradius by accident."` | libreto v1, v2, v3, home-v7 | **CANON-v3** (línea suelta centrada, post-hero) |
| 2 | `"You scroll down. You rise. That is the point."` | libreto v1 (transcript línea 716) | **RECHAZADO** |

Cita del rechazo (Gabriel, línea 723, verbatim): `"no se sobre lo de 'scroll down. you rise. that is the point' / no se si es que no entiendo la metafora o es un juego de palabras. pero yo diria: cual es el point? no entendi / pero esta bien. Creo que sobra un poco. es obvio que es diferente. la gente esta viendo que hace scroll down y sube"`

### 3.3 Confesión / Philosophy / Conviction

Este es el bloque con más versiones de todo el sitio. Es el mismo slot conceptual: el bloque de creencia que sigue al hero.

**Era 0 y 1: "An Act of Faith"**

Versión v1.0 (`4768f66`), DESCARTADA:
- H2: `"An Act of Faith"`
- P1: `"Only one in four software engineers is happy in their current role. The rest are burning out — buried in maintenance, context-switching, and systems that were designed to extract, not to inspire."`
- P2: `"Paradius exists because we believe the quality of what we build can never be separated from how we treat the people who build it. When engineers work where their craft is respected — where architecture comes first and shortcuts are not negotiable — something shifts. They stop performing. They start creating."`
- P3: `"We filter carefully. We collaborate, never delegate. And we build from the foundation up, because what is laid right does not need to be rebuilt."`
- Blockquote: `"For engineers: a place where you spend your time building, not fighting the system. For companies: software built by people who chose to be here — and it shows in every line."`

Versión `dbc3032` (SEO), DESCARTADA al migrar a Astro `833dadb`:
- H2: `"An Act of Faith"` (sin cambios)
- P1: `"Only one in four software engineers is happy in their current role. The rest are burning out — buried in maintenance, context-switching, and systems that were designed to extract output, not to cultivate craft."`
- P2: `"<strong>Paradius</strong> was born from a simple conviction: the quality of what we build can never be separated from how we treat the people who build it. When engineers work where their craft is respected — where architecture comes first and shortcuts are not negotiable — something shifts. They stop performing. They start creating."`
- P3: `"At Paradius, we filter carefully. We collaborate, never delegate. And we build from the foundation up, because what is laid right does not need to be rebuilt."`
- Blockquote: idéntico a v1.0.

**Era 2: "Architecture Begins With People"** (VIGENTE-PROD, `Philosophy.astro`, `#philosophy` + `#philosophy-card`; idéntico en home-v3 como `01 — CONVICTION`)

- H2: `"Architecture Begins With People"`
- P1: `"Great engineering doesn't come from process or tooling. It comes from people with the spark — the ones who see systems not as they are, but as they should be, and commit themselves to building that future."`
- P2: `"Most teams optimize for speed, tickets, and output. We optimize for intention. For engineers who think in architecture, not tasks. For people who choose discipline over convenience, clarity over shortcuts, and ownership over excuses."`
- P3: `"That's why Paradius works differently: we curate talent with the will to build things that last — people who bring structure, direction, and momentum to every project they touch."`
- Blockquote: `"For engineers: a place where your spark is an asset, not a liability. For companies: architecture-first teams driven by will, not inertia — reducing risk, accelerating delivery, and creating systems that endure."`

**Era 3, variantes comprimidas del mismo bloque:**

- home-v4, párrafo único (fusión de los tres), DESCARTADO: `"Great engineering doesn't come from process or tooling — it comes from people with the spark, who see systems as they should be and commit to building that future. Paradius curates talent with the will to build things that last: engineers who think in architecture, choose discipline over convenience, and bring structure, direction, and momentum to every engagement."`
- home-v5, versión recortada (pierde la cláusula final), DESCARTADO: `"Great engineering doesn't come from process or tooling — it comes from people with the spark, who see systems as they should be and commit to building that future. Paradius curates talent with the will to build things that last."`
- home-v5 y v6 cambian el H2 a `"Architecture begins with people."` (minúscula y punto final). DESCARTADO.
- home-v6 usa el párrafo largo de v4 verbatim.
- El blockquote (`"For engineers: a place where your spark is an asset..."`) sobrevive idéntico en v3, v4, v5 y v6, y muere en v7.

**Era 4: la confesión** (CANON-v3, ocupa el slot `#philosophy` en home-v7)

- Versión v1 del libreto, RECHAZADA: `"There are ten thousand agencies with better rankings, better funding, better manners. You will not find us in a search. Paradius exists for one reason: its founder does not know how to give up."`
- Cita del rechazo (Gabriel, línea 826, verbatim): `"Buena frase .tal vez no hablaria de its founder BUT we o algo asi. Y hay que cuidar un poco la frase para que no parezca que suene como. somos una mierda pero no nos rendimos.... Adicionalmente la entrada no se si es la adecuada siendo un bloque central. Se percibe vacio."`
- Versión aprobada, **CANON-v3**: `"You can find ten thousand agencies with better rankings, better funding, better manners."` + en `<em>`: `"You will not find one that refuses to quit the way we do."`

### 3.4 Tesis Power | Will

Bloque que solo existe en la era 4. Sin predecesores.

| Posición | Texto verbatim | Estado |
|---|---|---|
| Apertura, centro | `"Before it was a company, Paradius was a story: a world made by two forces."` | CANON-v3 |
| Izquierda (Power) | `"Power: the architecture, the guardrails, the discipline that keeps systems from rotting."` (en home-v7 el markup lo separa: label `Power`, texto `"The architecture, the guardrails, the discipline that keeps systems from rotting."`) | CANON-v3 |
| Derecha (Will) | `"Will: the spark. People who cannot leave things worse than they found them."` (markup: label `Will`, texto `"The spark. People who cannot leave things worse than they found them."`) | CANON-v3 |
| Cierre, centro | `"Every system that endures needs both. Most companies sell you one and call it engineering."` | CANON-v3 |

Corrección de jerarquía aplicada (Gabriel, transcript, verbatim): `"no entiendo cual es la peyorativa con power. will y power deberian tener la misma estructura jerarquica son dos partes de la misma moneda no? Y naturalmente las cosas de will son melodia. power es voice"`. Resultado: misma escala tipográfica para ambos, dos timbres, nunca uno grande y otro chico.

### 3.5 Engine / mecánica de operación

**Era 2 (VIGENTE-PROD): no existe como "engine". El slot equivalente son dos componentes:**

`HowWeSelect.astro` (`#selection`), VIGENTE-PROD:
- Título: `"How we select"`
- Intro: `"No algorithmic screening. No credential theater. We curate engineers the way we'd build our own team — through conversation, code, and a short engagement that proves the fit."`
- Paso 1 `"Architecture review"`: `"We examine past systems — not resumes. Code samples, design decisions, trade-offs they navigated. We look for engineers who think in layers."`
- Paso 2 `"Standards conversation"`: `"A technical dialogue, not an interview. How do they approach testing? Documentation? What do they refuse to ship? Their answers reveal practice, not performance."`
- Paso 3 `"Trial engagement"`: `"Before full commitment, a scoped project with real stakes. We see how they communicate, estimate, and handle ambiguity. The work speaks."`

`VelocityModule.astro`, VIGENTE-PROD:
- Título: `"Velocity is a consequence of standards"`
- P1: `"Fast teams aren't fast because they skip steps. They're fast because they don't have to revisit decisions, explain context twice, or fix what was rushed the first time."`
- P2: `"Our engineers use AI as a standard of practice — not a shortcut, but a multiplier applied to work that was already rigorous. The foundation stays clean. The pace compounds."`
- Acento de cierre: `"You don't hire us because we move fast. You hire us because what we build doesn't slow you down later."`

`Expertise.astro` (`#expertise`, "ported 1:1 from the live landing"), VIGENTE-PROD:
- Título: `"What Paradius Architects"`
- Subtítulo: `"Architecture-first software development, delivered by senior engineers who care about what they leave behind."`
- Card 1 `"System Architecture"`: `"Every decision at the foundation echoes through the lifetime of a product. We design systems from the architecture up — scalable, maintainable, and built to evolve with your business rather than against it."`
- Card 2 `"Cross-Platform Engineering"`: `"Native-quality experiences on every platform, from a single source of truth. We choose the right technology for the problem — then execute it with the discipline that turns a good idea into a lasting product."`
- Card 3 `"Technical Integrity"`: `"We review every line. We test what matters. We document what others skip. Not because a process demands it, but because the engineers here hold themselves to that standard."`

**Era 3: THE ENGINE, cuatro pilares** (home-v4 y home-v6, DESCARTADO)

Tesis larga (v4 y v6): `"Not a monolithic staffing agency. A high-throughput, distributed software engine engineered for absolute architectural excellence."`
Tesis corta (v5): `"Not a staffing agency. A distributed software engine."`

| Pilar | Mono strip | Texto |
|---|---|---|
| `Surgical recruitment` | `sniping pipeline · network nodes · deep profile evaluation` | `"A curated recruitment pipeline targeting high-caliber talent through direct network nodes, rigorous references, and evaluations aligned with our core ethos — never headcount, always density."` |
| `Distributed operating model` | `hub immersion · senior mentor · zero-latency sync` | `"High-redundancy, distributed architecture — not a static nucleus. Physical immersion at our office hub, paired with a senior mentor, then transition to fully remote without loss in throughput."` |
| `Guardrails & observability` | `automated guardrails · drift correction · executive metrics` | `"Proprietary AI-accelerated development plugin enforcing automated guardrails over every line shipped, with delivery observability and precise operational metrics for executive leadership."` |
| `Built to scale` | `US-nearshore · B2B frameworks · R&D bench` | `"Supported by standard US-nearshore rate structures, ironclad B2B legal frameworks, and a dynamic internal R&D ecosystem — ready to scale execution capacity on demand."` |

Las mono strips están **explícitamente prohibidas** por la Text quality bar, que cita `"sniping pipeline · network nodes"` como el ejemplo de lo que no se puede hacer.

Nodos comprimidos de home-v5, DESCARTADOS:
- `Acquisition`: `"Surgical sniping pipeline. Direct network nodes & stress-testing."`
- `Operation`: `"Zero-latency physical immersion & senior mentorship."`
- `Guardrails`: `"AI-accelerated plugins & real-time drift correction."`

Selection reescrito en jerga engine (home-v4), DESCARTADO:
- `Sniping pipeline`: `"Direct network nodes, rigorous references, and deep profile evaluations that match our core ethos. We target high-caliber talent surgically — not through volume screening."`
- `Stress-testing`: `"Comprehensive technical and behavioral stress-testing that surfaces how engineers think under pressure, communicate trade-offs, and hold the line on quality."`
- `CEO synchronization`: `"A direct synchronization with our CEO to ensure total alignment with what it means to build under the Paradius banner — architectural excellence as a shared standard."`

OPERATION, cuatro bloques (home-v4; en home-v6 quedaron declarados pero sin renderizar), DESCARTADOS:
- `Hub immersion`: `"Every engagement begins with complete physical immersion at our office hub, paired directly with a senior mentor who enforces rigorous quality standards from day one."`
- `Zero-latency environment`: `"Daily face-to-face communication establishes operational transparency and high fault tolerance — blockers eliminated in real time, context shared as a collective mental processor."`
- `Remote without drift`: `"Once channels are fully established, developers transition to fully remote with no loss in throughput — the synchronization hardwired into our proprietary development plugin."`
- `Context redundancy`: `"Mentorship distributes context across multiple team members, eliminating single points of failure and enabling zero-friction transitions when scaling talent."`

ASSURANCE, franja de cinco métricas (home-v4 y home-v6 completa, home-v5 recortada), **RECHAZADA**:
- `~100% developer retention` · `US-nearshore rate structures` · `Ironclad B2B frameworks` · `Internal R&D bench, warm and evolving` · `Scale on demand`
- Recorte de v5: `"~100% retention. US-nearshore rates. B2B frameworks."`
- Causa de muerte (transcript línea 822, verbatim): `"la strip de assurance... desapareció — era parte de la verborrea final que odiabas"`.

**Era 4: THE ENGINE narrativo** (CANON-v3, cuatro líneas)

- Derecha (Will): `"We do not hire headcount. We find the ones with the spark and push them further than they believed they could go."`
- Izquierda (Power): `"Every engagement begins in one room: our hub, a senior mentor at the next desk, standards enforced from day one."`
- Izquierda (Power): `"Then they go remote. And nothing degrades, because the discipline travels with them."` + CTA `"Read the full operating model"` → `/mockups/engine/`
- Derecha (Will): `"Nobody here is disposable. Almost nobody leaves."`

**engine.astro, página de detalle completa** (existe, linkeada desde v4/v6/v7, voz incompatible con el canon v3, estado ambiguo)

- Meta title: `"The Paradius Engine — Operating Model"`
- Meta description: `"The complete operational definition of Paradius — a high-throughput, distributed software engine engineered for architectural excellence."`
- Eyebrow: `OPERATING MODEL` / H1: `"The Paradius Engine"` / lede: `"Not a monolithic staffing agency. A high-throughput, distributed software engine."`

SYS-01 ACQUISITION:
> `"Paradius is not a monolithic staffing agency or a high-volume headhunting mill; it is a high-throughput, distributed software engine engineered for absolute architectural excellence. Our operation begins with surgical precision: a curated sniping pipeline where we target high-caliber talent through direct network nodes, rigorous references, and deep profile evaluations that match our core ethos."`
> `"Every engineer undergoes comprehensive technical and behavioral stress-testing, culminating in a direct synchronization with our CEO to ensure total alignment with what it means to build under the Paradius banner. While our operational capacity spans the entire tech spectrum—acknowledging regional limits in specialized niches like robotics or hyper-focused generative AI—we never measure our strength by developer headcount, but by the density and caliber of our output, supported by dynamic talent pipelines ready to scale execution capacity on demand."`
> Cita: `"We never measure our strength by developer headcount, but by the density and caliber of our output."`

SYS-02 DISTRIBUTED OPERATION:
> `"Operationally, Paradius functions as a high-redundancy, distributed architecture rather than a static nucleus. When a developer joins an engagement, they begin with complete physical immersion at our office hub, paired directly with a senior mentor who enforces our rigorous quality standards."`
> `"This zero-latency physical environment accelerates growth, enforces strict time commitment, and transforms the workplace into a shared mental processor where blockers are eliminated in real time. This human synchronization is hardwired into our proprietary AI-accelerated development plugin, which enforces strict, automated guardrails over every single line of code shipped."`
> `"Daily face-to-face communication establishes operational transparency and high fault tolerance; once these channels are fully established, developers transition to a fully remote model without any loss in throughput. Furthermore, our mentorship framework naturally eliminates single points of failure—context is continuously distributed across multiple team members, ensuring immediate gap-filling and zero-friction transitions when scaling talent."`
> Cita: `"A shared mental processor where blockers are eliminated in real time."`

SYS-03 INFRASTRUCTURE & RETENTION:
> `"We handle the full technical infrastructure and tooling, equipping our engineers with everything required to become indispensable assets. Our AI plugin and delivery observability stack enforce automated guardrails, correct development drift in real time, and give executive leadership precise, day-to-day operational metrics. This process continuously updates both client knowledge bases and our own internal standards."`
> `"Beyond technical guardrails, Paradius achieves a developer retention rate near 100%. Designed by an engineer for engineers, our environment fosters long-term commitment through continuous learning, performance-driven bonuses, and ongoing training in multicultural communication, language skills, and platform adaptation—enabling our talent to seamlessly integrate and scale into high-impact positions within Fortune 500 environments — from big-box retail to enterprise platforms."`
> Cita: `"Designed by an engineer, for engineers."`

SYS-04 COMMERCIAL SCAFFOLDING:
> `"Supported by standard US-nearshore rate structures, ironclad B2B legal frameworks, and a dynamic ecosystem of internal R&D projects that keep our bench warm and evolving, Paradius is built to scale in record time."`
> `"Our ultimate objective in any strategic partnership is to deploy this distributed intelligence, tackle high-complexity challenges, and redefine the standards of software execution."`
> Cita: `"Built to scale in record time."`

CTA final: H2 `"Deploy distributed intelligence"` / texto `"Ready to tackle high-complexity challenges with a team built for architectural excellence."` / botones `"Start your team"` y `"Browse the registry"`.

**Nota crítica**: `engine.astro` es el único lugar de todo el corpus donde aparecen tres datos comerciales que no existen en ninguna otra parte: la limitación regional declarada (`"acknowledging regional limits in specialized niches like robotics or hyper-focused generative AI"`), los bonos por performance, y el vínculo explícito Fortune 500 / big-box retail. También contradice al canon v3 al citar `"a developer retention rate near 100%"` mientras el home ya no cita números.

### 3.6 Proofs / casos en el home

| # | Versión | Fuente | Estado |
|---|---|---|---|
| 1 | `04 — EVIDENCE` con `"See our work"` + `"Architecture-first engagements for enterprise teams — anonymized case studies that show how we design, build, and leave systems better than we found them."` | v3 a v6, y `WorkTeaser.astro` en producción | VIGENTE-PROD |
| 2 | `CS-001: Fortune 500 retail. Task completion -31%. Rollout 40 to 220 stores. No added headcount.` / `CS-002: Series B payments. Fraud losses -26% in the first quarter.` | libreto v1 | **RECHAZADO** |
| 3 | `"Fortune 500 retail: task completion down 31 percent. Forty stores became two hundred twenty. No added headcount."` `[CS-001]` / `"Series B payments: fraud losses down 26 percent in the first production quarter."` `[CS-002]` | libreto v2 | **RECHAZADO** |
| 4 | Apertura `"We leave systems better than we found them. Then they stay that way."` + los dos frutos narrados | libreto v3, home-v7 | **CANON-v3** |

Cita del rechazo (Gabriel, línea 730, verbatim, completa): `"Lo que digo es que si esos son casos reales. Esta maal redatado el del FORTUNE 500. Y el otro es directamente falso. / Fortune 500 es SimplAutomation donde yo trabjao. / que hice ahi. Pues el producto entero xd. Que hace mi producto. Pues es la alabarda visual de los almacenes y los robots y tal. Que hice yo. Pues crear un sistema que permite que todo se traduzca a un lenguaje visual coordinando n mil servicios. Que logro Paradius que soy yo. Pues fundamentalmente hacer que la compania fuera comprada por Home Depot y se decidieran a implemntar las cosas de Simpl en muchos de sus almacenes. / nada de esto se puede mencionar claramente. pero pues la idea es que si que crecieronlos productos gracias a la capacidad de paradius / y lo otro de Series B Payments? Digamos que se refiere a los trabajos que hacia en los bancos. Pero no es fraude lo que se redujo. es missing payments, delays, seguirdad de transacciones, etc."`

Texto CANON-v3 de los dos frutos (en home-v7 llevan h3 propio):
- h3 `Warehouse automation`: `"We built the visual language that lets robots, inventory and hundreds of services move as one. A Fortune 500 retailer now runs it across its network."`
- h3 `Banking infrastructure`: `"Payments stopped going missing. Delays became guarantees. Those systems are still standing, years later, untouched by us."`

Los kickers mono-caps `WAREHOUSE AUTOMATION` y `BANKING INFRASTRUCTURE` fueron RECHAZADOS junto con toda la voz mono.

### 3.7 Canopy / dawn

Bloque que solo existe en la era 4. En home-v7 ocupa el id `#assurance` (herencia del slot de la franja de métricas que reemplazó).

- Pico tipográfico 2: `"The dawn is not ours. It is yours."`
- Cierre: `"Our engineers carry codes instead of names. Your systems carry no signature of ours. We build the morning; you keep it. That is the whole story of Paradius, and it ends the same way every time: we disappear into your success."`

Estado: **CANON-v3**, sin cambios desde el libreto v1 (es el único bloque grande que nació aprobado y nunca se tocó).

### 3.8 Teasers finales (la copa)

| # | Versión | Fuente | Estado |
|---|---|---|---|
| 1 | `"See our work"` + `"Architecture-first engagements for enterprise teams — anonymized case studies that show how we design, build, and leave systems better than we found them."` + CTA `"View case studies"` | producción, v3 a v6 | VIGENTE-PROD |
| 2 | `"Browse our talent"` + `"Senior engineers across architecture, mobile, and back-end — anonymized profiles you can review, filter, and request within 48 hours."` + CTA `"Explore the catalog"` | producción, v3 a v6 | VIGENTE-PROD |
| 3 | Paneles auxiliares de home-v3: label `Case studies` + `"Anonymized architecture-first engagements — systems designed, built, and left better than we found them."`; label `Talent registry` + `"Senior engineers across architecture, mobile, and back-end — review, filter, and request within 48 hours."` | home-v3 solamente | DESCARTADO |
| 4 | `"The registry"` + `"Senior engineers under code names: review, filter, request. Presented within 48 hours."` + CTA `"Browse the registry"` (izquierda, Power) | home-v7 / libreto v3 | **CANON-v3** |
| 5 | `"The work"` + `"What we built and left standing. Anonymized, like everything we do."` + CTA `"View case studies"` (derecha, Will) | home-v7 / libreto v3 | **CANON-v3** |

Cambio de orden: de v3 a v6 primero va Evidence/Work y después Registry/Talent. En v7 se invierte: Registry a la izquierda primero, Work a la derecha después.

### 3.9 CTAs, censo completo de labels

| Label | Destino | Dónde aparece | Estado |
|---|---|---|---|
| `"Get in touch"` | `#contact` | landing pre-Astro | DESCARTADO |
| `"Browse our talent"` | `/talent` | Astro S1, y como H1 de `/talent` hoy | Vive solo como título de página |
| `"Browse the registry"` | `/talent` | hero de todas las versiones + copa de v7 | **VIGENTE-PROD y CANON-v3** |
| `"Start your team"` | `/contact` | hero de todas las versiones + engine.astro | **VIGENTE-PROD y CANON-v3** |
| `"Explore the catalog"` | `/talent` | TalentTeaser (prod, v3 a v6) | VIGENTE-PROD, no está en el canon v3 |
| `"View case studies"` | `/work` | WorkTeaser (prod, v3 a v7) | **VIGENTE-PROD y CANON-v3** |
| `"Read the full operating model"` | `/mockups/engine/` | v4, v6, v7 | Vive en el mockup; destino es una ruta de mockup |
| `"Build your team"` | `/contact` | footer de `/talent`, footer de cada caso, H1 de `/contact` | VIGENTE-PROD |
| `"Request this profile"` | `/contact?profile={code}` | `/talent/[code]` | VIGENTE-PROD |
| `"View profile"` | `/talent/[code]` | TalentCard | VIGENTE-PROD |
| `"Deploy distributed intelligence"` | (H2 del CTA final) | engine.astro | Mockup |
| `"Send inquiry"` | submit del form | `/contact` | VIGENTE-PROD |

**Conflicto pendiente**: el canon v3 dice `"one label per intent, reused verbatim everywhere"` con exactamente dos labels. Producción tiene siete labels distintos apuntando a dos destinos. Si se porta el libreto, hay que decidir qué pasa con `"Explore the catalog"`, `"Build your team"`, `"Request this profile"` y `"View profile"` en las páginas internas.

---

## 4. Censo de las otras páginas

### 4.1 Chrome global (todas las páginas)

**Header (`Header.astro`)**, VIGENTE-PROD:
- aria-label del logo: `"Paradius — Home"` / title: `"Paradius LLC"`
- Nav: `"Philosophy"`, `"Selection"`, `"Expertise"`, `"Talent"`, `"Work"`, `"Contact"`
- Botón hamburguesa: `"Toggle menu"`
- Versión pre-Astro del nav (DESCARTADA): solo `"Philosophy"`, `"Expertise"`, `"Contact"`
- Versión v1.0 del aria-label (DESCARTADA): `"Paradius LLC Home"`

**Footer (`Footer.astro`)**, VIGENTE-PROD:
- `"Registered in Wyoming, USA"`
- `"LinkedIn"` → `https://www.linkedin.com/company/paradius/`
- `"© 2026 Paradius LLC. All rights reserved."`
- Versión v1.0 (DESCARTADA): sin LinkedIn, con email `contact@paradius.dev` visible.

**BaseLayout**: `"Skip to main content"`, `"Paradius"` (apple-mobile-web-app-title y application-name).

**humans.txt** (`landing_page`, verbatim):
```
/* TEAM */
Team: Paradius
Founder: Gabriel Chorens
Website: https://paradius.dev
Location: Sheridan, Wyoming, USA

/* SITE */
Standards: HTML5, CSS3
Software: Hand-coded with care
```

### 4.2 `/talent` (catálogo), VIGENTE-PROD

- Hero título: `"Browse our talent"`
- Hero descripción: `"Senior nearshore engineers, vetted and ready to present within 48 hours. Filter by role, stack, seniority, and availability — then request the profiles that fit."`
- Leyendas de filtros: `"Role"`, `"Seniority"`, `"Availability"`, `"Stack"`; opción común `"All"`
- Labels de availability: `"Available now"`, `"Available soon"`, `"Currently assigned"`
- Placeholder de búsqueda: `"Search stack (e.g. flutter, go)"`
- Estado dinámico: `"Registry: {total} active profiles"` / `"Registry: {visible} of {total} active profiles"`
- Footer del catálogo: `"Assembling a cross-functional team?"` + CTA `"Build your team"`
- Card: CTA `"View profile"`, meta `"{seniority} · {years} years experience"`
- Labels de seniority: `"Junior"`, `"Mid-level"`, `"Senior"`, `"Staff"`
- Labels de rol: `"Mobile"`, `"Backend"`, `"Frontend"`, `"Full-stack"`, `"DevOps"`

**Versiones de mockup borradas (`0798e39`, recuperadas de `0798e39^`):**

- `talent-a.astro` (Variante A, editorial), DESCARTADA: eyebrow `"Staff augmentation"`, título `"Browse our talent"`, descripción `"Senior nearshore engineers, vetted and ready to present within 48 hours. Pick profiles, assemble your squad — we handle the rest."`, footer CTA `"Need a full squad assembled?"` + `"Build your team"`.
- `talent-b.astro` (Variante B, card grid, la APROBADA por D12): misma descripción que hoy vive en producción, footer `"Assembling a cross-functional team?"` + `"Build your team"`.
- `FilterBar.astro` (mockup), DESCARTADO: `"Filters preview — interactive filtering ships in S3"`; grupos `Stack` (All/Flutter/Go/React/Kubernetes), `Seniority` (All/Senior/Staff/Mid), `Availability` (All/Available now/Soon).
- `MockupBanner.astro`, DESCARTADO: `"Design mockup"` + `"— Phase S2.5 · awaiting approval"` + link `"All mockups"`.
- `mockups/index.astro`, DESCARTADO: eyebrow `"Phase S2.5"`, título `"Design mockups"`, descripción `"Visual variants for new pages — awaiting Gabriel's approval before S3 implementation. All routes use fixture data and are excluded from the sitemap."`; entradas como `"Talent catalog — Variant A" / "Editorial list rows with generous whitespace and minimal stack hints."` y `"Case study" / "Fortune 500 retailer case — problem, solution, outcome."`

**Nota de copy descartado con valor**: `"Pick profiles, assemble your squad — we handle the rest."` es la formulación más corta y directa del modelo de negocio que existió jamás. Murió al elegirse la variante B.

### 4.3 `/talent/[code]` (perfil), VIGENTE-PROD

- Link de vuelta: `"← Back to catalog"`
- Meta-bloques: `"Availability"`, `"Seniority"`, `"Stack"`, `"Languages"`
- Nota fija: `"Profiles presented within 48 hours"`
- CTA: `"Request this profile"` → `/contact?profile={code}`
- Sección: `"Experience"`; fechas con `"Present"` cuando no hay `endDate`
- SEO dinámico: `"{code} — {headline} — Paradius LLC"`
- Mockups `profile-a` / `profile-b` (borrados): sin copy propio; CTA fija `"Request this profile"`. Se aprobó la variante B (dossier con sidebar sticky).

### 4.4 `/work`, VIGENTE-PROD

- Hero título: `"See our work"`
- Hero descripción: `"Architecture-first staff augmentation for enterprise teams — anonymized case studies that show how we design, build, and leave systems better than we found them."`
- Caso individual: `"← Back to case studies"`, secciones fijas `"Problem"`, `"Solution"`, `"Outcome"`, condicional `"What we left behind"`, eyebrow `CS-{001}`, CTA `"Build your team"`
- Mockup `work.astro` (borrado): sin copy propio, renderizaba `fortune-500-home-improvement-retailer`, mismas secciones fijas.

### 4.5 `/contact`, VIGENTE-PROD

- Eyebrow: `"Start a conversation"`
- Título: `"Build your team"`
- Descripción actual: `"Every engagement is scoped to your architecture. Tell us who you need — we reply within 24 hours with matched profiles and a rate proposal."`
- Descripción anterior (mockup S2.5 y `4372496`, DESCARTADA): `"Tell us who you need. We reply within 24 hours with vetted profiles — senior engineers ready to present within 48 hours. No pricing on the site; we scope rates in private conversation."`
- Éxito: título `"Inquiry sent"`, texto `"Thank you — we reply within 24 hours with vetted profiles that match your needs."`
- Error por defecto: `"Something went wrong"`
- Nota de build sin API: `"Online submission is unavailable in this build — use the form to compose your message, then send via email below."`
- Labels: `"Name"`, `"Email"`, `"Company"`, `"Requisition"`, `"Message"` (el label `"Interested profiles"` del mockup fue renombrado a `"Requisition"` por D13)
- Placeholders: `"Your name"`, `"you@company.com"`, `"Company name"`, `"Describe your team needs, timeline, and tech stack..."`
- Hint sin perfiles: `"Add profiles from the talent catalog — chips appear when you follow a profile link."`
- Hint con perfiles (runtime): `"Pre-filled from catalog — remove chips you no longer need."`
- Hint del mockup (DESCARTADO): `"Pre-filled from catalog — removable chips ship in S5"`
- Honeypot: label `"Website"`
- Submit: `"Send inquiry"`; en envío: `"Sending…"`
- Fallback: `"Prefer email?"` + `solutions@paradius.dev`
- Noscript: `"JavaScript is required for online submission. Email us directly at {email}."`
- Aria de chip: `"Remove {code}"`
- Sin API configurada al enviar: título `"Email your inquiry"`, mensaje `"Online submission is not configured for this build. Use the link below to email us directly."`
- Errores: `"Unable to reach our servers."`, título `"Please wait"` para rate limit, `"Too many requests — please try again in a minute."`, `"Something went wrong sending your inquiry."`, `"Please fix the highlighted fields."`
- Validación cliente: `"Name is required"`, `"Email is required"`, `"Enter a valid email address"`, `"Company is required"`, `"Message is required"`

### 4.6 SEO y JSON-LD (texto real del sitio, hoy desalineado del canon)

**HOME_SEO:**
- title: `"Paradius | High-End Software Engineering Consultancy — Paradius LLC"`
- description: `"Paradius is a high-end software engineering consultancy registered in Wyoming, USA. Paradius LLC specializes in system architecture, scalable back-end systems, cross-platform development, and technical consulting. Architecture-first. Engineer-first."`
- og:title: `"Paradius | High-End Software Engineering Consultancy"`
- og:description: `"Paradius LLC is a software engineering consultancy that puts architecture first and engineers first. System design, cross-platform development, and technical integrity. Based in Sheridan, Wyoming."`
- twitter:description: `"Paradius LLC — architecture-first software engineering. System design, cross-platform development, technical integrity. Sheridan, Wyoming."`
- webPageName: `"Paradius — High-End Software Engineering Consultancy"`
- speakableSelectors: `#hero-heading`, `#philosophy-heading`, `#expertise-heading`

**Organización (constants.ts):**
- name `"Paradius"`, legalName `"Paradius LLC"`, alternateNames `"Paradius LLC"`, `"Paradius Software"`, `"Paradius Dev"`
- email `solutions@paradius.dev`, foundingDate `"2026"`, founder `"Gabriel Chorens"`
- slogan: `"Architecting the dawn from within"`
- dirección: `30 N Gould St, STE R, Sheridan, WY 82801, US`
- `ORG_DESCRIPTION`: `"Paradius is a high-end software engineering consultancy. We specialize in system architecture, cross-platform development, scalable back-end systems, and technical consulting. Architecture-first, engineer-first."`
- `PROFESSIONAL_SERVICE_DESCRIPTION`: `"Paradius LLC provides high-end software engineering consulting services including system architecture design, cross-platform engineering, scalable back-end systems, and technical integrity audits."`
- `ORG_KNOWS_ABOUT`: `"Software Architecture"`, `"System Design"`, `"Cross-Platform Development"`, `"Mobile Development"`, `"Back-End Engineering"`, `"Technical Consulting"`, `"Enterprise Software"`, `"Digital Transformation"`, `"Legacy System Modernization"`
- `SERVICE_TYPES`: `"Enterprise Software Engineering"`, `"System Architecture Design"`, `"Cross-Platform Development"`, `"Scalable Back-End Systems"`, `"Technical Consulting"`, `"Digital Transformation"`, `"Legacy System Modernization"`
- `DEFAULT_KEYWORDS`: `"Paradius, Paradius LLC, Paradius software, Paradius engineering, Paradius consultancy, Paradius dev, paradius.dev, software engineering consultancy, system architecture, cross-platform development, technical consulting, Wyoming software company, high-end software engineering"`
- Solo en `landing_page`, no portado: `priceRange: "$$$"`, `numberOfEmployees: {minValue: 1, maxValue: 10}`, `twitter:site: @paradius_dev`, `geo.placename: Sheridan, Wyoming`

**SEO de `/talent`:**
- title `"Browse Our Talent — Paradius LLC"`; description `"Senior nearshore engineers, vetted and ready to present within 48 hours. Filter by role, stack, seniority, and availability — then request the profiles that fit your team."`
- og:description `"Staff augmentation from Paradius — senior nearshore engineers across mobile, backend, frontend, and DevOps. Profiles presented within 48 hours."`
- twitter:description `"Browse vetted senior engineers from Paradius. Filter by stack and availability, request profiles within 48 hours."`
- CollectionPage: `"Anonymous senior engineer profiles available for staff augmentation through Paradius LLC."`

**SEO de `/work`:**
- title `"Case Studies — Paradius LLC"`; description `"Anonymized case studies from Paradius staff augmentation engagements — enterprise delivery across mobile, backend, and platform engineering. Assemble your nearshore team and present profiles within 48 hours."`
- og:description `"See how Paradius nearshore squads deliver for enterprise teams — architecture-first engagements with measurable outcomes."`
- twitter:description `"Paradius case studies — anonymized proof of staff augmentation delivery for Fortune 500 and scale-up teams."`
- CollectionPage: `"Anonymized case studies from Paradius staff augmentation engagements for enterprise and scale-up teams."`

**SEO de `/contact`:**
- title `"Build Your Team — Paradius LLC"`; description `"Tell us who you need. Senior nearshore engineers, vetted and ready to present within 48 hours. We reply within 24 hours — rates scoped in private conversation."`
- og:description `"Start a staff augmentation conversation with Paradius — request vetted senior engineer profiles and assemble your nearshore team."`
- ContactPage: `"Start a staff augmentation conversation with Paradius LLC — request senior nearshore engineer profiles."`

**DEUDA de SEO**: todo este bloque está en registro genérico `"high-end software engineering consultancy"`. No refleja ni la reescritura de `833dadb` (era 2) ni el mito Power/Will (era 4). El copy visible cambió dos veces y el SEO no se tocó nunca. Además contiene em-dashes por todas partes, prohibidos por la Text quality bar (aunque esa regla se enunció para copy visible; los metadatos son zona gris que hay que decidir).

### 4.7 Lo que planean los docs para estas páginas

Mapa de rutas V1 (`doc/02-public-site.md`, verbatim de la columna Content):
- `/` → `"Evolved landing: hero, philosophy, expertise, teaser of catalog + cases, CTA"`
- `/talent` → `"Anonymous catalog: one card per profile (PRD-XXX, seniority, roles, stack, years, availability) with client-side filters by stack / seniority / availability"`
- `/talent/[code]` → `"Full anonymous profile: summary, experience timeline, languages. CTA: "Request this profile""`
- `/work` → `"2–3 case studies (anonymized client descriptors)"`
- `/contact` → `"Contact form + mailto fallback + (optional) call scheduling link"`

Loop de conversión (verbatim, los cinco pasos):
1. `"Client filters the catalog, opens profiles that fit."`
2. `""Request this profile" / "Build my team" adds the PRD-XXX code(s) to the contact form."`
3. `"Form POSTs to POST /v1/public/leads on Paradius Core (validated, rate-limited, admin notified by email)."`
4. `"Gabriel gets an email notification; replies with the Paradius-branded Anonymous Profile CVs (full identity is only disclosed later in the deal, off-platform)."`
5. `"Fallback for form-averse visitors: mailto:solutions@paradius.dev with prefilled subject (Interested in PRD-007)."`

Fuera de alcance declarado (verbatim): `"Blog, named developer profiles, client login, i18n (site stays English)"`; `"Any server-side rendering or runtime API calls from visitors"`; `"Payment, scheduling infrastructure (a Calendly link is enough if added)."`

---

## 5. Datos y casos

### 5.1 `cases.json` (3 casos, verbatim, estado actual en disco)

#### case-001, `published: true`

- title: `"Store operations platform modernization"`
- slug: `"fortune-500-home-improvement-retailer"`
- clientDescriptor: `"Fortune 500 US home improvement retailer"`
- problem: `"Store associates relied on fragmented legacy tools for inventory lookups, task management, and customer assistance. Peak-season load caused frequent timeouts, and each new feature required months of coordination across siloed teams."`
- solution: `"Paradius assembled a nearshore squad to design a unified associate mobile experience and event-driven inventory APIs. We introduced a modular Flutter client with offline-first patterns, backed by Go microservices on Kubernetes and a Kafka-based sync layer aligned to the client's existing identity provider."`
- stack: `flutter, go, kafka, kubernetes, ddd, ci-cd, terraform`
- outcome: `"Associate task completion time dropped 31% in pilot stores, inventory lookup p95 latency fell from 4.2s to under 800ms, and the client expanded the rollout from 40 to 220 locations within two quarters — without adding internal headcount."` **← VETADO (métrica -31% inventada)**
- metrics: `{ "value": "−31%", "label": "Task completion time" }` **← VETADO**, `{ "value": "4.2s → 800ms", "label": "Inventory lookup p95" }`, `{ "value": "40 → 220", "label": "Store rollout" }`
- leftBehind: `"A test suite covering 94% of business-critical paths, runbooks for on-call rotations, and an architecture decision log the client's team still references."`

#### case-002, `published: true`

- title: `"Real-time fraud detection pipeline"` **← VETADO (el trabajo real no era sobre fraude)**
- slug: `"fintech-payments-scale-up"`
- clientDescriptor: `"Series B payments scale-up"`
- problem: `"A fast-growing payments company processed rising transaction volume on a rules engine that could not keep pace. False positives frustrated merchants while genuine fraud slipped through during promotional spikes."` **← VETADO**
- solution: `"We delivered a streaming fraud-scoring service in Go with feature stores fed by Kafka, plus a React operations console for analysts to tune rules without deployments. The architecture preserved the client's existing PCI boundaries and audit trails."` **← VETADO**
- stack: `go, kafka, react, postgresql, redis, aws, event-driven`
- outcome: `"Fraud losses decreased 26% in the first production quarter while false-positive disputes dropped 19%, freeing the risk team to focus on new product launches instead of manual reviews."` **← VETADO (fraude + -26% + -19%)**
- metrics: `{ "value": "−26%", "label": "Fraud losses" }` **← VETADO**, `{ "value": "−19%", "label": "False-positive disputes" }` **← VETADO**, `{ "value": "0", "label": "Deployments for rule changes" }`
- leftBehind: `"A self-service rules console with full audit trails, Grafana dashboards for real-time fraud signals, and documentation that passed PCI-DSS review without findings."` **← VETADO (menciona fraude)**

#### case-003, `published: false`

- title: `"Clinical workflow digitization"`
- slug: `"regional-healthcare-network"`
- clientDescriptor: `"Regional healthcare network"`
- problem: `"Clinicians at a multi-site healthcare network still coordinated referrals and follow-ups through paper handoffs and shared spreadsheets, creating compliance risk and delayed patient care."`
- solution: `"Paradius built a HIPAA-aligned referral workflow platform with a React clinician portal, Java integration services to the client's EHR, and role-based audit logging. We ran accessibility reviews with nursing staff before each release train."`
- stack: `react, java, spring-boot, postgresql, accessibility, ci-cd, aws`
- outcome: `"Average referral closure time improved from 11 days to 6 days across pilot clinics, and compliance audits reported zero critical findings related to the new workflow in the first year of operation."`
- metrics: `{ "value": "11 → 6 days", "label": "Referral closure time" }`, `{ "value": "0", "label": "Critical compliance findings" }`, `{ "value": "100%", "label": "WCAG 2.1 AA compliance" }`
- leftBehind: `"An accessibility-first component library, EHR integration patterns reusable across sites, and training materials co-authored with nursing staff."`

No está mencionado en la deuda documentada, no está publicado, y no corresponde a ningún trabajo real citado por Gabriel. Estado: sin decisión.

### 5.2 Qué está vetado y cuál es el reemplazo aprobado

Deuda declarada por el dueño (`PRODUCT.md`, "Copy consistency debt", verbatim):

> `/work` and `src/content/fixtures/cases.json` still tell the old version with invented numbers (-31%, -26%) and a "fraud" outcome. They must be rewritten to match the proofs above (missing payments / delays / transaction security, adoption at scale). Owner approves all case copy.

| Vetado | Dónde vive hoy | Reemplazo aprobado |
|---|---|---|
| `-31%` task completion | case-001 outcome y metrics | Sin cifra. El eje es adopción a escala: `"A Fortune 500 retailer now runs it across its network."` |
| `-26%` fraud losses | case-002 outcome y metrics | Sin cifra. El eje es `"payments stopped going missing"` |
| `-19%` false-positive disputes | case-002 metrics | Eliminar |
| Framing `"fraud"` completo (título, problem, solution, leftBehind) | case-002 entero | Reframe a `missing payments`, `delays`, `transaction security` |
| Framing "rescate" (nombrar el desastre previo) | Los tres problems | Prohibido: `"naming what things were before humiliates the people who lived it"` |

Los dos proofs aprobados que deben reemplazar los outcomes actuales, verbatim:

- `"Warehouse automation: we built the visual language that lets robots, inventory and hundreds of services move as one. A Fortune 500 retailer now runs it across its network."`
- `"Banking infrastructure: payments stopped going missing. Delays became guarantees. Those systems are still standing, years later, untouched by us."`

Regla de proceso: `"Owner approves all case copy."` Ninguna reescritura de casos se publica sin aprobación explícita de Gabriel.

Contexto real detrás de los casos (Gabriel, verbatim, **no publicable literalmente**): el Fortune 500 es SimplAutomation, comprada por Home Depot; el producto es `"la alabarda visual de los almacenes y los robots"`; el logro es que Home Depot comprara la compañía e implementara Simpl en muchos de sus almacenes. `"nada de esto se puede mencionar claramente."` El caso bancario son trabajos en bancos, sobre missing payments, delays y seguridad de transacciones.

### 5.3 `profiles.json` (5 perfiles, verbatim)

No hay deuda declarada sobre estos perfiles. Se listan completos porque son el contenido real de `/talent` en modo fixtures.

**PRD-001, `"Senior Flutter Developer"`** · senior · mobile, fullstack · 9 años · available
- stack: `bloc, ci-cd, dart, ddd, firebase, flutter, graphql, postgresql, rest, riverpod, testing`
- summary: `"Senior mobile engineer with nine years building production Flutter apps for fintech and logistics clients. Delivers clean-architecture codebases, offline-first experiences, and measurable release velocity through strong CI/CD discipline."`
- exp 1 `"Senior Flutter Developer"`, 2021-04 a presente, `"fintech startup"`:
  - `"Led migration of a 120k-MAU consumer wallet from legacy native screens to Flutter, cutting crash-free sessions from 97.1% to 99.6% within two quarters."`
  - `"Introduced feature-flagged releases and golden tests that reduced regression defects in payment flows by 42%."`
  - `"Mentored four mid-level engineers on DDD folder structure and bloc/cubit testing patterns."`
- exp 2 `"Flutter Developer"`, 2018-02 a 2021-03, `"logistics software company"`:
  - `"Built driver and dispatcher apps for a regional logistics platform handling 18k daily shipments."`
  - `"Implemented background geolocation sync and optimistic UI updates for low-connectivity routes."`
  - `"Partnered with backend team to design REST contracts later reused across three client projects."`
- exp 3 `"Mobile Developer"`, 2016-06 a 2018-01, `"digital agency"`:
  - `"Shipped two white-label retail apps on tight agency timelines with shared design-system components."`
  - `"Established CI pipelines with automated widget tests on every pull request."`
- idiomas: es (native), en (C1)

**PRD-002, `"Senior Backend Engineer (Go & Java)"`** · senior · backend · 11 años · soon
- stack: `aws, docker, event-driven, go, grpc, java, kafka, kubernetes, postgresql, redis, spring-boot, terraform`
- summary: `"Backend specialist with eleven years designing event-driven platforms for retail and payments. Strong in Go microservices and Java integration layers, with a track record of cutting p99 latency while keeping operational complexity manageable."`
- exp 1 `"Staff Backend Engineer"`, 2020-01 a presente, `"enterprise retail technology group"`:
  - `"Replaced a monolithic order service with twelve Go microservices on Kubernetes, improving peak-season throughput by 3.2× without additional headcount."`
  - `"Introduced outbox-pattern event publishing to Kafka, eliminating duplicate charges in marketplace checkout flows."`
  - `"Owned on-call rotation and reduced Sev-1 incidents from nine per quarter to two through SLO dashboards and runbooks."`
- exp 2 `"Senior Java Developer"`, 2016-03 a 2019-12, `"payments processor"`:
  - `"Built Spring Boot services handling card-present and card-not-present authorization for mid-market merchants."`
  - `"Designed idempotent settlement APIs consumed by three acquiring partners."`
  - `"Led PCI-scoped audit preparation for two consecutive years with zero critical findings."`
- exp 3 `"Backend Developer"`, 2013-07 a 2016-02, `"B2B SaaS company"`:
  - `"Maintained multi-tenant billing and usage-metering services supporting 400+ enterprise accounts."`
  - `"Migrated reporting workloads from synchronous SQL to Redis-backed materialized views."`
- idiomas: en (native), es (B2)

**PRD-003, `"Senior React Frontend Engineer"`** · senior · frontend, fullstack · 8 años · available
- stack: `accessibility, css, nextjs, react, storybook, tailwind, testing, typescript, vite, wcag`
- summary: `"Frontend engineer focused on design-system-driven React applications for B2B and consumer brands. Combines strong accessibility discipline with performance tuning — consistently shipping sub-2s LCP on content-heavy dashboards."` **← contiene em-dash, viola la Text quality bar**
- exp 1 `"Senior Frontend Engineer"`, 2021-09 a presente, `"healthcare analytics platform"`:
  - `"Led rebuild of clinician dashboard from legacy jQuery to React 18 + TypeScript, improving task completion time by 28% in usability studies."`
  - `"Established Storybook as the single source for 60+ accessible components with automated axe checks in CI."`
  - `"Partnered with design to implement WCAG 2.1 AA patterns for data tables, modals, and form validation."`
- exp 2 `"Frontend Developer"`, 2018-05 a 2021-08, `"e-commerce marketplace"`:
  - `"Built seller portal features in Next.js serving 12k active merchants."`
  - `"Reduced client bundle size by 35% through route-based code splitting and image optimization."`
  - `"Introduced visual regression tests that caught layout breaks before production releases."`
- exp 3 `"UI Developer"`, 2016-01 a 2018-04, `"media streaming startup"`:
  - `"Implemented responsive marketing sites and embedded players used by two million monthly visitors."`
  - `"Collaborated with backend on GraphQL schema for personalized content rails."`
- idiomas: en (C1), pt (B1)

**PRD-004, `"Senior QA Engineer"`** · **`seniority: mid`** (inconsistencia: el headline dice Senior) · fullstack · 7 años · available
- stack: `api-testing, ci-cd, cypress, jest, playwright, postman, selenium, test-automation, test-planning`
- summary: `"Quality engineer with seven years bridging manual exploratory testing and automated coverage for web and mobile products. Builds pragmatic test pyramids that catch regressions early without slowing delivery teams."`
- exp 1 `"Senior QA Engineer"`, 2020-06 a presente, `"insurtech scale-up"`:
  - `"Designed end-to-end Playwright suites for policy quoting and claims workflows, cutting production defects by 48% within six months."`
  - `"Introduced contract tests between mobile apps and GraphQL gateway, surfacing breaking changes in pull requests."`
  - `"Ran release readiness reviews with product and engineering, establishing clear go/no-go criteria."`
- exp 2 `"QA Automation Engineer"`, 2018-01 a 2020-05, `"HR software company"`:
  - `"Migrated flaky Selenium suites to Cypress for payroll and benefits modules."`
  - `"Built performance test harness validating 5k concurrent users on annual enrollment peaks."`
  - `"Authored test data factories reused across three product squads."`
- exp 3 `"QA Analyst"`, 2017-03 a 2017-12, `"digital agency"`:
  - `"Owned manual and exploratory testing for client launches across retail and nonprofit verticals."`
  - `"Documented reproducible bug reports that reduced developer rework cycles."`
- idiomas: en (C1), es (native)

**PRD-005, `"Staff DevOps Engineer"`** · staff · devops, backend · 12 años · unavailable
- stack: `ansible, aws, docker, github-actions, grafana, helm, kubernetes, linux, prometheus, terraform`
- summary: `"Staff-level platform engineer with twelve years operating cloud-native infrastructure for high-traffic consumer and enterprise workloads. Expert in Terraform/IaC, Kubernetes hardening, and observability stacks that keep on-call sustainable."`
- exp 1 `"Staff DevOps Engineer"`, 2019-02 a presente, `"global streaming media company"`:
  - `"Designed multi-region EKS clusters serving 40M monthly active users with automated failover drills."`
  - `"Reduced infrastructure provisioning time from days to under 20 minutes via Terraform modules and GitOps workflows."`
  - `"Built cost attribution dashboards that drove 22% savings on idle compute without impacting SLOs."`
- exp 2 `"Senior Site Reliability Engineer"`, 2015-08 a 2019-01, `"ad-tech platform"`:
  - `"Owned CI/CD pipelines processing 300+ daily deployments across 80 microservices."`
  - `"Implemented golden-signal alerting that cut mean time to detect from 18 minutes to under four."`
  - `"Led incident retrospectives and blameless postmortems adopted company-wide."`
- exp 3 `"Systems Engineer"`, 2012-06 a 2015-07, `"managed hosting provider"`:
  - `"Automated bare-metal provisioning and configuration with Ansible for hundreds of customer environments."`
  - `"Migrated legacy VM farms to containerized workloads on early Docker Swarm clusters."`
- idiomas: en (native), único perfil con un solo idioma

**Observaciones sobre los perfiles:**
- Ninguna fuente los declara vetados, pero traen decenas de cifras (`97.1% a 99.6%`, `42%`, `3.2×`, `48%`, `22%`) del mismo tipo que las que se vetaron en los casos. Si la regla `"No invented numbers"` aplica a todo el sitio, estos perfiles son la mayor concentración de números sin auditar que queda.
- PRD-004 tiene headline `"Senior QA Engineer"` con `seniority: "mid"`. Discrepancia sin decisión.
- El schema Zod (`src/lib/api/schemas.ts`) valida forma y tipos pero **no impone ninguna regla de contenido**: no hay validación contra em-dashes ni contra métricas. Las leyes de la Text quality bar viven solo como texto de proceso.
- `content.config.ts` (comentario verbatim): `"Fixture data for offline builds (Phase S2). Schema validation lands in S2; the collection is registered here so Astro does not auto-generate it."`
- El campo `leftBehind` tiene contenido propio en los tres casos y `PRODUCT.md` no lo menciona en absoluto. Es opcional en el schema. Sin decisión sobre si sobrevive, se reescribe o se elimina.

---

## 6. Planes y visiones estructurales

### 6.1 Rutas y páginas, estado real

| Ruta / feature | Fuente del plan | Estado |
|---|---|---|
| `/` (home) | `doc/02-public-site.md`, S1 | HECHO (era 2). Pendiente portar el libreto v3 |
| `/talent` catálogo con filtros | S3 | HECHO |
| `/talent/[code]` perfil | S3 | HECHO |
| `/work` catálogo | S4 | HECHO |
| `/work/[slug]` caso | S4 | HECHO, con copy en deuda |
| `/contact` form + mailto | S5 | HECHO |
| `/mockups/*` (S2.5) | S2.5 | HECHO y luego BORRADO (`0798e39`) tras aprobación D12 |
| `/mockups/home-v3` a `v7` | ninguno (trabajo de agosto) | Existen como mockups, no en prod |
| `/mockups/engine` | ninguno | Existe, linkeada desde v7, sin decisión de si se promueve a ruta real |
| Blog | `doc/02-public-site.md` | ABANDONADO explícitamente (`"Out of scope"`) |
| Perfiles con nombre real | idem | ABANDONADO explícitamente |
| Login de cliente | idem | ABANDONADO explícitamente |
| i18n / sitio en español | idem | ABANDONADO explícitamente (`"site stays English"`) |
| Scheduling / Calendly | D6 | ABANDONADO en V1 (`"A free Google Calendar appointment-schedule link can be added later without code changes"`) |
| Pricing público | D1 | **PROHIBIDO** permanentemente |
| Registry / lenguaje de registro (`Registry: N active profiles`, `CS-001`, `STEP-01`, chips `Requisition`) | S8 Brand System v2 | HECHO en `/talent` y `/work`; **el mono como decoración fue luego prohibido en el home** |
| Índice de navegación lateral fijo (`01–05` en sidebar) | S8 Ola 2 | RECHAZADO por Gabriel en review (`"removed per Gabriel review — no fixed sidebar"`) |
| Paradius CV template / export PDF | `doc/01-backend`, Ops O4 | PENDIENTE, nunca construido |
| Pantalla de ingestión de perfiles + botón Publish | Ops O5 | PENDIENTE |
| Migración del CRM viejo | C8 | CANCELADA (D7, base de datos vacía) |
| DNS swap a `paradius.dev` | S7 | BLOQUEADO dos veces: aprobación visual de Gabriel y seed de perfiles reales (C9) |

### 6.2 El "resume composer / traductor" y el pipeline de contenido

Lo que los planes llaman `"Paradius CV template"` es el compositor de currículums. Definición verbatim (`doc/01-backend-paradius-core.md`):

> `"Paradius CV template: the Anonymous Profile is never delivered as a raw CV. It renders through a branded Paradius export template written for corporate buyers — outcomes and impact first, consistent layout across all developers, Paradius visual identity."`

Fase O4 de Ops (PENDIENTE, checkbox sin marcar), verbatim:
> `"PDF renderer (pdf package) implementing the Paradius CV template: branded, corporate-facing, outcomes-first, identical layout for every developer."` / `"Renders the AnonymousProfile projection only — the export path physically takes the anonymous type, so a full-PII export cannot happen by accident."`

Fase O5 (PENDIENTE), verbatim:
> `"Ingestion screen: paste Profile Standard JSON → validate (schema + core_models parsing) → preview both projections side by side → curate tags → submit as draft."` / `"Publish button (app bar): POST /v1/publish with confirmation + last-publish timestamp."`

**Consecuencia de contenido**: hoy no existe ninguna UI para producir o publicar contenido del sitio. Todo el contenido de `/talent` y `/work` sale de fixtures escritos a mano.

### 6.3 Reglas de anonimización (definen qué se puede escribir en un perfil)

Verbatim de `doc/01-backend-paradius-core.md`:
- `"The anonymization boundary is server-side: GET /v1/public/profiles is a projection over developers that selects only non-PII fields (code, headline, seniority, roles, stack, years_experience, summary, anonymized experience, languages, availability) where visibility = 'published'. PII physically cannot leave through a public route."`
- `"Remove: name, address, phone, email, GitHub, LinkedIn, any personal URL."`
- `"Replace each company name in work experience with an industry descriptor (Landarium → "music-tech startup", Capital Software S.A. → "software consultancy")."`
- `"Keep: roles, dates, achievement bullets, tech stacks, education, certifications, spoken languages."`
- `"Identity is PRD-XXX + headline (e.g. "PRD-007 — Senior Flutter Developer")."`

Flujo de publicación (3 pasos, verbatim): `"1. Edit data through the Ops app (or a script during the interim). 2. Call POST /v1/publish (a "Publish" button in Ops) — the API hits the Vercel Deploy Hook. 3. Vercel rebuilds the site, fetching fresh public profiles and cases at build time."`

División de responsabilidades (`doc/03-crm.md`, verbatim): `"The site sells; Ops operates."`

### 6.4 Decision log D1 a D13, con impacto de contenido

| # | Decisión (verbatim abreviada) | Impacto en el contenido |
|---|---|---|
| D1 | `"Rates are never public. The site shows no pricing anywhere; rates are discussed in private conversation only."` | Prohíbe toda página de pricing |
| D2 | `expectedRate` es dato PII interno, excluido de todo el sitio | Ningún perfil muestra tarifa |
| D3 | `"Home Depot case study: yes, anonymized — "Fortune 500 US home improvement retailer". No client names anywhere on the site."` | El nombre real del cliente nunca se publica |
| D4 | `"Launch with exactly 1 case study"` + `"Gabriel provides the raw notes; the writing agent drafts, Gabriel approves."` | Hoy hay 2 publicados, no 1 |
| D5 | Leads a `solutions@paradius.dev` | Email visible en todo el sitio |
| D6 | `"No scheduler integration in V1. Conversion = form + email."` | No hay "agendá una llamada" |
| D7 | CRM viejo vacío, migración cancelada | Sin impacto de copy |
| D8 | Ops Android-first | Sin impacto de copy |
| D9 | Cuentas Railway/Resend | Sin impacto de copy |
| D10 | `"Copy positioning: hybrid, commercial-leaning. Home keeps the philosophy section and premium voice, but hero subtitle and CTAs become benefit-driven; /talent and /work are directly commercial (staff augmentation explicit: pick profiles, assemble a team, 48h-availability framing). No pricing anywhere (D1)."` | **Es la decisión que produjo el subtítulo `"Curated talent drafting the future's blueprint"`. El libreto v3 la contradice al eliminar el subtítulo comercial del hero. D10 no fue revocada formalmente.** |
| D11 | Gate de aprobación de diseño por mockups antes de implementar | Explica la existencia de `/mockups/` |
| D12 | Talent = variante B, Profile = variante B, `"ParadiusDawn is retired from running text — Gabriel finds it illegible in normal copy. It survives ONLY inside pre-rendered SVG artwork"` | Fija la tipografía y mata ParadiusDawn como fuente de texto |
| D13 | `"Brand System v2 (S8): System voice = mono at high weights... Three typographic jurisdictions: Monumento (hero lockup SVG only), Voz (Cormorant — manifesto, quotes, bridge lines), Sistema (mono — operational headings, eyebrows, data, buttons, footer). Accent #c0c8d4 marks system information only... Requisition chips replace "Interested profiles""` | **REVOCADA PARCIALMENTE el 27 ago: el mono como voz de sistema está prohibido en el home. D13 sigue vigente para `/talent` y `/work`.** |

### 6.5 Copy que los planes declaran NO aprobado

Dos citas verbatim de `doc/plans/02-site-phases.md` que siguen sin resolverse:

- `"Copy pending Gabriel approval on screen: hero subtitle, bridge line, How we select steps, velocity module text (drafted per D10)."`
- `"S4 — Case copy: Fortune 500 retailer draft lives in cases.json fixture (anonymized per D3); Gabriel approval of final copy still pending."`

Es decir: buena parte del copy que hoy está en producción nunca pasó por aprobación formal en pantalla.

### 6.6 Contradicción entre planes, sin arbitrar

`doc/plans/01-core-phases.md` (Deviation C3) dice `"Added qa to DeveloperRole"`. `doc/plans/02-site-phases.md` (Deviation S2) dice `"DeveloperRole has no qa value in core_models; QA fixture (PRD-004) uses roles: ["fullstack"]"`. Los dos documentos se contradicen sobre el mismo momento del proyecto. Afecta a cómo se etiqueta PRD-004 en el catálogo.

---

## 7. Copy muerto pero rescatable

Líneas descartadas que siguen teniendo valor, con la causa de muerte y por qué vale la pena tenerlas a mano.

### 7.1 De la era 0 y 1 (landing pre-Astro)

| Línea | Por qué murió | Por qué sigue sirviendo |
|---|---|---|
| `"Only one in four software engineers is happy in their current role. The rest are burning out — buried in maintenance, context-switching, and systems that were designed to extract output, not to cultivate craft."` | Reescritura completa de Philosophy en `833dadb` | Es el único dato externo verificable que Paradius usó jamás. Si alguna vez hace falta un ancla factual que no sea una métrica de caso inventada, esta es la que existe. |
| `"We filter carefully. We collaborate, never delegate. And we build from the foundation up, because what is laid right does not need to be rebuilt."` | Misma reescritura | Tres promesas operativas en 25 palabras. `"We collaborate, never delegate"` es la formulación más nítida del anti-staffing que existe. |
| `"For engineers: a place where you spend your time building, not fighting the system. For companies: software built by people who chose to be here — and it shows in every line."` | Reescrito a la versión "spark / architecture-first" | La versión vieja es más concreta y menos abstracta que la que la reemplazó. |
| `"Engineering as an act of faith. Quality as a consequence of conviction."` | Cambiado a "act of will" por la reescritura SEO | Rima conceptualmente con la mitología Power/Will: "conviction" es voluntad. Es un puente entre la era 0 y el canon v3. |

### 7.2 De la era 2 (producción actual, condenada por el canon v3)

| Línea | Por qué muere | Por qué sigue sirviendo |
|---|---|---|
| `"You don't hire us because we move fast. You hire us because what we build doesn't slow you down later."` | El libreto v3 elimina VelocityModule | Cumple la barra `"something no other agency could sign"` mejor que casi cualquier línea del canon. Argumento comercial puro sin métricas. |
| `"No algorithmic screening. No credential theater."` | El libreto v3 elimina HowWeSelect | Cuatro palabras que atacan directo al competidor. El canon v3 no tiene ninguna línea equivalente de diferenciación contra agencias de reclutamiento. |
| `"We examine past systems — not resumes."` | Idem | La promesa de selección más concreta que existió. |
| `"We review every line. We test what matters. We document what others skip. Not because a process demands it, but because the engineers here hold themselves to that standard."` | Expertise no está en el libreto v3 | Es la definición operativa de "Power" (guardrails, discipline) en lenguaje concreto, no mitológico. |
| `"Great engineering doesn't come from process or tooling. It comes from people with the spark."` | Reemplazado por la tesis Power/Will | La palabra "spark" sobrevive en el canon (`"We find the ones with the spark"`). Esta es su definición original. |

### 7.3 De la era 3 (linaje engine)

| Línea | Por qué murió | Por qué sigue sirviendo |
|---|---|---|
| `"We never measure our strength by developer headcount, but by the density and caliber of our output."` | Jerga engine descartada | Sigue viva en `engine.astro`. Es la formulación más clara de por qué Paradius no compite por volumen. Conecta con `"We do not hire headcount"` del canon. |
| `"Designed by an engineer, for engineers."` | Idem | Cinco palabras que dicen "Paradius soy yo" sin decir "founder". Compatible con la regla de voz "we". |
| `"acknowledging regional limits in specialized niches like robotics or hyper-focused generative AI"` | Nunca salió de `engine.astro` | Es el único acto de honestidad comercial de todo el corpus, y la honestidad es un valor declarado del dueño. Diferenciador potente si se surfacea. |
| `"performance-driven bonuses, and ongoing training in multicultural communication, language skills, and platform adaptation"` | Idem | Único lugar donde se explica qué recibe el ingeniero. Material para una futura página de carreras. |
| `"context is continuously distributed across multiple team members, ensuring immediate gap-filling and zero-friction transitions when scaling talent"` (Context redundancy) | Se perdió al comprimir de v4 a v7 | Responde a la objeción número uno del comprador: qué pasa si se va el ingeniero. El canon v3 no la responde. |
| `"A shared mental processor where blockers are eliminated in real time."` | Jerga engine | Imagen fuerte, cero jerga real. Podría sobrevivir traducida al registro narrativo. |

### 7.4 Del proceso de libreto (transcript)

| Línea | Por qué murió | Por qué sigue sirviendo |
|---|---|---|
| `"You scroll down. You rise. That is the point."` | Gabriel: no entendió la metáfora y sobra | Muerta de verdad. Se registra para que nadie la re-proponga. |
| `"...its founder does not know how to give up."` | Voz prohibida ("we", nunca "its founder") | El contenido emocional sigue siendo el núcleo del mito. Solo el sujeto gramatical estaba mal. |
| `"Pick profiles, assemble your squad — we handle the rest."` (mockup talent-a) | Se eligió la variante B | La explicación más corta del modelo de negocio que existió. Candidata para un bloque de "cómo funciona". |
| `"Need a full squad assembled?"` (mockup talent-a) | Idem | Alternativa más directa que `"Assembling a cross-functional team?"`. |
| `"No pricing on the site; we scope rates in private conversation."` (ContactForm pre-`833dadb`) | Reescrito a `"a rate proposal"` | Es la única línea que explicaba D1 al visitante. Hoy el sitio simplemente no menciona precios, sin explicar por qué. |

### 7.5 Fósiles estructurales, no textuales

- El experimento "TYPE LAB" en `home-v7.astro` (`data-typelab='s'`, Allerta Stencil para Power y Saira Stencil para Will) sigue en el código pero inactivo. El experimento stencil está declarado CERRADO (`"five fonts tried and rejected 2026-08-27"`).
- `home-v6.astro` declara `selectionSteps` y `operationBlocks` en el frontmatter y no los renderiza. Datos muertos que pueden confundir a quien lea el archivo.
- `ParadiusDawn-Regular.woff2` sigue en `public/assets/` sin usarse en runtime (`"kept for reference/rollback"`).
- La estadística `~100% developer retention` está muerta como chip del home pero viva en `engine.astro` como `"a developer retention rate near 100%"`.

---

## 8. Huecos

Contenido que ninguna versión del sitio tuvo nunca y que el posicionamiento de "empresa sólida" o los propios planes requieren. Listados con qué hay hoy en su lugar y qué bloquea llenarlos.

### 8.1 Página o sección de "cómo trabajamos" para el comprador

**Falta.** Todo el proceso documentado (`How we select`, `How we operate`, hub, mentor, remoto) describe cómo Paradius selecciona y forma **ingenieros**, nunca qué le pasa al **cliente** después de firmar: kickoff, cadencia de reporte, quién es el punto de contacto, qué pasa si un ingeniero no funciona, cómo se escala o se reduce el equipo. El comprador corporativo pregunta esto siempre. El único material adyacente es `"Context redundancy"` de home-v4, que murió.

### 8.2 Pricing y modelo comercial

**Prohibido, no faltante.** D1 es explícita: `"Rates are never public."` Pero el sitio tampoco explica **por qué** no hay precios. La línea que lo hacía (`"No pricing on the site; we scope rates in private conversation."`) fue eliminada de `ContactForm` en `833dadb`. Hueco real: no hay ninguna señal de rango, modelo (por hora, por equipo, retainer) ni de a qué tamaño de cliente apunta. `engine.astro` menciona `"standard US-nearshore rate structures"`, pero está enterrado en un mockup y nunca fue promovido.

### 8.3 About / quiénes somos

**Falta por completo.** No hay ninguna página ni sección que diga quién dirige Paradius, dónde está el hub físico (se lo menciona repetidamente como `"our hub"` sin decir dónde), cuánta gente es, desde cuándo opera. Los únicos datos son metadatos JSON-LD invisibles: `founder: "Gabriel Chorens"`, `foundingDate: "2026"`, `numberOfEmployees: 1 a 10` (este último solo en `landing_page`, no portado). Tensión conocida: la regla de voz prohíbe `"its founder"` en el copy narrativo, pero eso es una regla sobre la confesión, no sobre la existencia de un about.

### 8.4 FAQ / objeciones

**Falta por completo.** Ninguna versión tuvo jamás una sección de preguntas frecuentes. Las objeciones obvias de un comprador de staff augmentation nearshore no están respondidas en ninguna parte: zona horaria y solapamiento, idioma, contratación y facturación (el sitio dice `"Ironclad B2B frameworks"` solo en un mockup descartado), propiedad intelectual, NDA, qué pasa si el ingeniero renuncia, período de prueba, cómo se reemplaza a alguien.

### 8.5 Testimonios y prueba social

**Falta por completo, y está estructuralmente bloqueado.** D3 prohíbe nombres de clientes en cualquier parte del sitio, y la ley de las pruebas prohíbe el framing de rescate. Un testimonio atribuido es incompatible con esas dos reglas. Hoy la única prueba social son dos casos anónimos, uno de ellos con copy vetado. No hay logos, no hay citas, no hay números de clientes. Es un hueco que requiere una decisión del dueño antes de poder llenarse.

### 8.6 Legal: privacidad, términos, cookies

**Falta por completo.** El sitio tiene un formulario que recoge nombre, email, empresa y mensaje, y los envía a un backend, sin ninguna política de privacidad, sin aviso de tratamiento de datos y sin términos de servicio. No hay ni una sola página legal en ninguna era del sitio ni en ningún plan. Para un comprador corporativo europeo o para cualquier revisión de compliance, esto es bloqueante. Es el hueco más urgente de los ocho.

### 8.7 Carreras / lado ingeniero

**Falta como página.** Paradius se define como una empresa que empuja gente (`"push them further than they believed they could go"`), y el mito entero es sobre ingenieros, pero no hay ninguna vía para que un ingeniero se postule. El material existe y está bien escrito, disperso en copy muerto: `"For engineers: a place where your spark is an asset, not a liability."`, `"Designed by an engineer, for engineers."`, los bonos por performance y el training multicultural de `engine.astro`, el hub con mentor senior. Es la página más fácil de armar porque el copy ya está escrito; solo hay que decidir que existe.

### 8.8 Definición del servicio en términos del comprador

**Parcialmente falta.** El sitio dice qué arquitecta Paradius (`System Architecture`, `Cross-Platform Engineering`, `Technical Integrity`) pero no dice cuál es la unidad de compra: un ingeniero, un equipo, un proyecto cerrado. Los docs lo tienen claro (`"staff augmentation — the client picks profiles — plus "we assemble the full team for you" as a framing on top of the same catalog"`) pero eso nunca se escribió como copy de página. El CTA `"Build your team"` insinúa la segunda opción sin explicarla nunca.

### 8.9 Cobertura, zona horaria y ubicación operativa

**Falta.** El sitio dice `"Registered in Wyoming, USA"` y `"nearshore"`, pero nunca dice nearshore respecto a qué, ni desde dónde se trabaja, ni en qué franja horaria. `"our hub"` aparece cinco veces en distintas versiones sin ubicarse jamás. Para un comprador de EE.UU., el solapamiento horario es un criterio de decisión de primer orden.

### 8.10 Página 404 y estados vacíos

**Sin censar y probablemente inexistente.** No apareció ningún `404.astro` en el inventario de páginas del repo. Tampoco hay copy para el catálogo vacío, que es un estado real y esperado: el plan advierte verbatim que `"/talent is empty in API mode until the database has published developers"`.

### 8.11 Explicación del sistema de códigos

**Falta.** El canon v3 introduce `"Our engineers carry codes instead of names"` como un momento poético del cierre, y `/talent` muestra `PRD-001` sin más. Pero nunca se explica al comprador por qué, ni cuándo conoce la identidad real (los docs lo tienen: `"full identity is only disclosed later in the deal, off-platform"`). Esa frase de los planes es exactamente el copy que falta en la página.

---

## Anexo: mapa de estructura de secciones, todas las versiones

| # | landing v1.0 / SEO | Astro S1 (`4372496`) | Producción HOY (`833dadb`) | home-v3 | home-v4 / v6 | home-v5 | home-v7 (CANON-v3) |
|---|---|---|---|---|---|---|---|
| 0 | Header (Philosophy/Expertise/Contact) | Header (+ Talent, Work) | Header (+ Selection) | Header | Header | Header | Header |
| 1 | Hero + subtítulo + `"Get in touch"` | Hero + 2 CTAs | Hero + subtítulo + 2 CTAs | Hero | Hero | Hero | Hero sin subtítulo |
| 2 | Philosophy `"An Act of Faith"` | Philosophy idem | Philosophy `"Architecture Begins With People"` (2 secciones) | 01 CONVICTION | 01 CONVICTION | 01 CONVICTION + CITA | Opener narrativo |
| 3 | Expertise `"What Paradius Architects"` | Expertise | HowWeSelect | 02 SELECTION | 02 THE ENGINE (4 pilares) | 02 ENGINE + nodos A/B/C | La confesión (pico 1) |
| 4 | Footer `#contact` | TalentTeaser | Expertise | 03 PRACTICE + Velocity | 03 SELECTION | 03 ASSURANCE | La tesis + split Power/Will |
| 5 | | WorkTeaser | VelocityModule | 04 EVIDENCE | 04 OPERATION | 04 EVIDENCE | The Engine (4 líneas) |
| 6 | | Footer | TalentTeaser | 05 REGISTRY | 05 ASSURANCE | 05 REGISTRY | The Proofs (2 casos) |
| 7 | | | WorkTeaser | | 06 EVIDENCE | | The Canopy / dawn (pico 2) |
| 8 | | | Footer | | 07 REGISTRY | | Copa: Registry izq + Work der |

`engine.astro` (página aparte): Hero → SYS-01 ACQUISITION → SYS-02 DISTRIBUTED OPERATION → SYS-03 INFRASTRUCTURE & RETENTION → SYS-04 COMMERCIAL SCAFFOLDING → CTA `"Deploy distributed intelligence"`.

---

## Anexo: deudas activas, en un solo lugar

1. **`cases.json` y `/work`** siguen con `-31%`, `-26%`, `-19%` y el framing "fraud". Reemplazo aprobado disponible. Requiere aprobación del dueño para el copy final.
2. **`PRODUCT.md`** todavía documenta `[system footnote: retention: ~100%]` en THE ENGINE, ya borrado del código. Borrar la línea.
3. **El libreto v3 no está portado a producción.** `Hero.astro`, `Philosophy.astro`, `HowWeSelect.astro`, `VelocityModule.astro`, `Expertise.astro` siguen con el texto de `833dadb` (18 jul).
4. **SEO y JSON-LD** nunca se actualizaron: siguen en registro genérico, desalineados de dos reescrituras de copy.
5. **D10 vs. libreto v3**: D10 exige subtítulo de hero benefit-driven, el libreto lo elimina. D10 no fue revocada formalmente.
6. **D13 vs. prohibición del mono**: D13 fija el mono como voz de sistema, la regla del 27 ago lo prohíbe en el home. D13 sigue vigente en `/talent` y `/work`.
7. **`engine.astro`** convive con el canon v3 usando vocabulario incompatible, y sigue linkeada desde home-v7 con `"Read the full operating model"` apuntando a una ruta de mockup.
8. **Copy de S8 nunca aprobado en pantalla** (hero subtitle, bridge line, How we select, velocity module) y copy del caso Fortune 500 tampoco.
9. **PRD-004**: headline `"Senior QA Engineer"` con `seniority: "mid"`.
10. **PRD-003**: su summary tiene un em-dash, prohibido por la Text quality bar.
11. **Tipografía de texto sin decidir.** El experimento stencil está cerrado; la familia final quedó pendiente de que Gabriel volviera con bocetos.
12. **`home-v6.astro`** tiene datos muertos declarados y no renderizados.
13. **Contradicción `qa` en `DeveloperRole`** entre `01-core-phases.md` y `02-site-phases.md`, sin arbitrar.
14. **`leftBehind`** existe en los tres casos y no está mencionado en el canon. Sin decisión.
