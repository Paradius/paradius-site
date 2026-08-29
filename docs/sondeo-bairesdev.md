# Sondeo estructural: bairesdev.com (2026-08-28)

Informe de síntesis sobre seis capítulos de censo de bairesdev.com (home y navegación, servicios y modelos, prueba social, confianza corporativa, conversión y talento, contenido y SEO), cruzado contra el censo de contenido de paradius.dev del 2026-08-27.

Propósito: extraer la ARQUITECTURA que hace que BairesDev se lea como empresa sólida, separar lo que depende de escala de lo que depende de estructura, y decidir qué de eso sirve para una boutique de un fundador con voz mítica propia.

Convención de este documento: la prosa está en español y no usa em-dashes ni en-dashes. Las citas verbatim se reproducen tal cual, incluidos sus guiones.

---

## 1. Mapa del sitio

Árbol de lo efectivamente censado. La marca indica el modo de producción de cada rama:

- **[A] artesanal**: escrita a mano, una vez, para esa página.
- **[P] programática**: plantilla rellenada a escala, con el mismo esqueleto de bloques y el mismo schema.org.
- **[M] modular**: página artesanal en su hero y su diferenciador, ensamblada con bloques de confianza reciclados verbatim entre páginas hermanas.

```
/                                    [A] home, 14 bloques
│
├── Services
│   ├── /services/                                          [M] hub de los 3 modelos
│   ├── /staff-augmentation/                                 [M] modelo 1
│   ├── /software-development-services/software-dedicated-team/  [M] modelo 2
│   │   └── alias /dedicated-teams/
│   ├── /software-development-services/software-outsourcing/ [M] modelo 3
│   ├── /solutions/                                          [P] catálogo plano de ~64 soluciones
│   │   └── /solutions/<disciplina>/hire/                    [P] variante "hire" por disciplina
│   ├── /nearshore-outsourcing/                              [M] venta del modelo nearshore
│   └── /software-development/                               [P] landing SEO geo vieja, contenido divergente
│
├── Technologies
│   ├── /technologies/                                       [P] listado, 77 slugs únicos en una sola carga
│   ├── /technologies/<tech>/                                [P] plantilla "servicios", schema con Service + AggregateRating
│   └── /technologies/<tech>/hire-developers/                [P] plantilla "hire", schema con FAQPage + BreadcrumbList
│
├── Industries
│   ├── /industries/                                         [P] 30 industrias en grid
│   └── /industries/<vertical>/                              [P] mismo esqueleto de schema que technologies/hire
│
├── About
│   ├── /about-us/ (= /about/)                               [A] narrativa + muro de credibilidad + timeline 2009-2026
│   ├── /about/leadership-team/                              [A] 33 ejecutivos con foto, nombre y cargo
│   ├── /about/certifications-and-partnerships/              [A] 19 certificaciones, hace de trust center de facto
│   ├── /awards-recognitions/                                [P] listado exhaustivo por año y categoría, 2019-2026
│   ├── /press/                                              [A] press releases propias + "As featured in..."
│   ├── /faq/                                                [A] FAQ central, corta, evasiva en lo operativo-legal
│   ├── /top-1-percent/                                      [A] página ancla del claim de calidad
│   ├── /join-us/                                            [A] careers, portal externo en talent.bairesdev.com
│   └── bairesdev.com/how-we-hire                            [A] proceso de vetting, fuera del subdominio www
│
├── Our Work
│   ├── /clients/ (= /case-studies/)                         [A] una sola página: ~70-100 logos + casos destacados
│   └── /case-studies/<cliente>/                             [P] plantilla fija: About, Challenge, Solution, Outcome, Quote, CTA
│
├── Blog
│   ├── /blog/                                               [A] listado, 5 categorías
│   └── /blog/<slug>/                                        [M] artículo largo, autor C-level real, FAQ + schema al pie
│
├── Recursos
│   ├── /tech-resource-center/                               [A] whitepapers, case studies PDF, infografías, sin gate
│   └── /resources/artificial-intelligence/                  [A] hub temático
│
├── Conversión
│   ├── /start/basic-details/                                [A] EL formulario. Destino único de todo CTA transaccional
│   └── /contact-us/                                         [A] formulario genérico, 3 campos
│
├── Legal
│   ├── /privacy-policy/                                     [A] 19 secciones + 16 apéndices jurisdiccionales
│   ├── /do-not-sell-my-personal-information/                [A] satélite CCPA, ~400 palabras
│   └── /terms-conditions/                                   [A] ~800 a 1000 palabras, términos del sitio, no del servicio
│
└── No existe (404 confirmado)
    ├── /security/                                           compliance vive dentro de certifications
    ├── /pricing/                                            política de sitio completo
    ├── /awards/                                             la ruta real es /awards-recognitions/
    └── /resources/ (raíz)                                   el hub real es /tech-resource-center/
```

**Proporción real de artesanía**: alrededor del 70% de las URLs indexables son producto de dos fábricas de plantillas corriendo en paralelo sobre el mismo catálogo (77+ tecnologías por 2 variantes, 30 industrias, ~64 soluciones, casos de estudio). El 30% restante (home, about, leadership, certifications, top-1-percent, careers, press, faq, legal, blog firmado) es lo que realmente construye la percepción de solidez. La fábrica construye superficie de búsqueda, no confianza.

**Nota sobre inconsistencias del propio sitio**: las cifras de aplicantes por año no coinciden entre páginas (`"more than a million job applications every year"` en `/hire-software-developers/` contra `"We vet over 2.5M+ people per year"` en `/top-1-percent/`). Es la prueba de que la fábrica de plantillas se actualiza por lotes y nadie mantiene una fuente única de verdad. No es un patrón a imitar, es la deuda que produce la escala.

---

## 2. Anatomía del home

Catorce bloques. Para cada uno, el trabajo que hace sobre el comprador.

| # | Bloque | Contenido ancla | Qué trabajo hace |
|---|---|---|---|
| 1 | Nav superior | Services, Technologies, Industries, About, Our Work, Blog + CTA "Schedule a Call" | Mapa de tres ejes (qué hacemos, con qué stack, para quién) más un único botón de conversión siempre visible. El mega menú es exposición de landing pages, no ayuda de navegación. |
| 2 | Hero | *"Accelerate your roadmap with our vetted nearshore **tech talent.**"* / *"Access 4,000+ timezone-aligned, **AI-augmented software engineers** across 100+ technologies."* | Responde "¿tienen suficiente gente y stack para mi proyecto?" antes de cualquier otra cosa. La escala ES el pitch. |
| 3 | Carrusel de casos | Google, Pinterest, con link "Read case study" | Prueba social ANTES de explicar qué hacen. La secuencia es: somos grandes, mirá con quién trabajamos, y recién ahí qué hacemos. |
| 4 | Grid de servicios | *"Every discipline, AI-augmented. From first design to final release."*, 6 tarjetas con chips enlazados | Índice navegable hacia landings especializadas. No vende acá, reparte tráfico. |
| 5 | Prensa y reconocimientos | *"As featured in..."* CNBC, Forbes, Insider, Bloomberg + 6 tarjetas (Financial Times, TechCrunch, Newsweek, SXSW, Stanford, Harvard Business School) | Convierte discurso propio en discurso ajeno. Nadie dice "somos buenos": lo confirman terceros con marca. |
| 6 | Stack tecnológico | *"Yes, we cover the tech stack and AI coding tools you rely on."* | Cierra la objeción técnica de cobertura, con link a `/technologies/`. |
| 7 | Testimonios | *"We've stopped counting. Over 500 brands count on us."* + 7 quotes con nombre y cargo | Cada testimonio es un CTA disfrazado: cita corta, atribución nominal, link al caso completo. Multiplica puertas de entrada sin saturar el scroll. |
| 8 | Awards | *"Excellence. Our minimum bar for client delivery."* + *"Over 160 awards, accolades, and achievements"* | Responde el riesgo real del comprador enterprise: no "¿son buenos programadores?" sino "¿esta empresa va a seguir existiendo en dos años?". |
| 9 | Propuesta de valor | *"No need to wonder."* / *"Working with us is wonderful."* + The right people / team / place / time | Objeciones de management, no técnicas: selección, estructura de equipo, timezone e idioma, flexibilidad de escala. Es un pitch a procurement. |
| 10 | Proceso de 3 pasos | *"Our process. Simple, seamless, streamlined."* + *"In a matter of days, we will finalize your project specifications"* | Reduce la fricción percibida de arranque. Contrarresta el miedo al onboarding de vendor largo. |
| 11 | Blog | *"Our latest insights."* + 3 posts con autor nombrado | Autoridad por firma humana. Señal de que hay gente pensando, no solo vendiendo. |
| 12 | CTA final | *"Want to accelerate software development at your company? **See how we can help.**"* | Cierre al mismo formulario de siempre. |
| 13 | Footer | 3 columnas + Get in Touch + newsletter + redes + legal + 6 badges de premios | Segundo mapa completo del sitio, más los badges como último sello de terceros antes de irse. |
| 14 | Banner de cookies | Decline All / Accept All | Infraestructura legal. Señal indirecta de empresa que pasó por revisión de compliance. |

**El patrón estructural que importa**: hay un solo verbo de conversión en toda la página. `"Schedule a Call"` aparece cinco o más veces y siempre apunta a `/start/basic-details/`. Todo lo demás es exploración: `"Everything we do"`, `"Our full repertoire"`, `"Our greatest hits"`, `"Our trophy cabinet"`. Variedad en las rutas de descubrimiento, cero variedad en la ruta de conversión.

**La secuencia emocional** es: escala, prueba, catálogo, terceros, stack, voces, premios, razones, proceso, pensamiento, cierre. Nótese que la explicación de por qué son buenos llega novena. Los primeros ocho bloques son todos prueba de existencia y tamaño.

---

## 3. La maquinaria de solidez

Inventario completo de mecanismos, con cómo funciona cada uno.

### 3.1 Claims numéricos como set fijo reciclado

Un bloque de stats de marca que se copia y pega sin recalcular: **500+ Active Clients**, **130+ Industry Sectors**, **96% Client Retention**, **1,480+ Projects Delivered**, **4.9/5 Clutch Rating**, **9/10 NPS**, **3+ years avg. engagement**, **4,000+ engineers**, **100+ technologies**, **20+ / 40+ países**, **160+ awards**, **91% customer satisfaction**.

Cómo funciona: no es un golpe único en un bloque, es refuerzo por repetición espaciada. Las mismas tres o cuatro cifras aparecen en el hero, en testimonios, en awards, en about, en certifications y en nearshore. La apuesta es que el visitante no lea todo pero absorba el número igual. El costo es la inconsistencia (1M contra 2.5M de aplicantes), visible solo para quien navega más de una página.

### 3.2 El claim de calidad convertido en página

`"Top 1%"` no es una frase, es una URL: `/top-1-percent/`, con un embudo visual de seis etapas que reduce *"2.5M+ people per year"* a un ícono. Cómo funciona: cualquier página puede afirmar el claim y linkear a la "prueba". La prueba es estadística de rechazo, no anécdota de calidad. Se sostiene sin necesitar un solo testimonio.

### 3.3 El vetting process como activo reutilizado

Cuatro pasos (tests técnicos, entrevista de HR, entrevista técnica por especialistas no reclutadores, motor de matching) más el dato *"Every year, over 2.5 million people apply to BairesDev. We hire fewer than 1%"*, repetidos casi verbatim en las cuatro páginas de servicio y en su propia página `how-we-hire`. Responde la objeción central del nearshore: "¿cómo sé que no me mandan juniors?". La respuesta es cuantitativa y de proceso, nunca cualitativa.

### 3.4 Awards por densidad acumulada

`/awards-recognitions/`, tres tabs (Technology Solutions, Management & Growth, Employer & Brand Citizenship), listado cronológico 2026 a 2019 con 15 a 25 entradas por categoría por año. Emisores recurrentes: Clutch, Globee, Stevie, Inc. 5000, IAOP, GoodFirms, The Manifest, Comparably, FlexJobs.

Cómo funciona: la cantidad ES el argumento. No importa que el lector no conozca "Globee Awards"; el peso está en la repetición y en la organización prolija. Muchos de estos premios son de organismos que existen para vender el premio. La estrategia no es calidad por unidad, es densidad.

### 3.5 Logos de clientes sin anonimizar

Grilla alfabética de ~70 a 100 nombres reales en `/clients/`, con destacados imposibles de objetar (Google, Rolls-Royce, Urban Outfitters, Pinterest). El logo por sí solo es la prueba: no hace falta leer nada, es escaneo visual.

### 3.6 Casos de estudio como plantilla narrativa

Esqueleto fijo en las tres páginas verificadas: Hero con el resultado como titular, barra de key stats (tamaño de equipo, duración, NPS, stack), cita del cliente, About, `"The challenge."`, `"The solution."`, `"The outcome."`, navegación a casos vecinos, y CTA personalizado **"Facing similar challenges to [Cliente]? See how we can help."**

Detalle relevante: las métricas de negocio duras son la excepción. Urban Outfitters tiene *"38% increase in net profits"*, pero Rolls-Royce y Google no tienen porcentaje: miden por alcance operativo (equipo de 20, cuatro años, cinco equipos). Es más honesto y más sostenible que inflar cada caso con un número.

### 3.7 Autoridad prestada de terceros

Tres capas: medios tier 1 (CNBC, Forbes, Bloomberg, Financial Times, TechCrunch, Newsweek), instituciones académicas (Harvard Business School con link a hbs.edu, Stanford, SXSW, World Economic Forum), y scores independientes (Clutch 4.9/5 con 60 reseñas). La tercera capa es la más fuerte porque es verificable fuera del dominio propio.

### 3.8 Compliance empaquetado como certificaciones

No existe `/security/` (404 confirmado). Todo el peso vive en `/about/certifications-and-partnerships/`, un grid de 19 ítems que mezcla ISO 27001:2022 real con partnerships comerciales de cloud (Google, AWS, Microsoft, Databricks, Salesforce) y certificaciones individuales de skill (Scrum, Java EE, LPIC-3). Cita verbatim del ítem que sí es de seguridad: *"This IRAM IQNET–issued ISO/IEC 27001:2022 credential recognizes BairesDev's commitment to strong information security practices"*.

Dato revelador: SOC 2, NDA y propiedad intelectual NO aparecen en las páginas institucionales de confianza. Solo salen en páginas de venta. Es decir, el compliance se vende en el funnel, no se declara en el "somos serios".

### 3.9 Proceso con compromiso de tiempo, nunca de precio

Lo único concreto que BairesDev promete es tiempo: `"2-4 weeks"`, contrastado explícitamente en el FAQ de staff augmentation contra *"traditional hiring, where recruiting, interviewing, and onboarding a single engineer typically takes 3-6 months."* Ese contraste de tiempo, no de precio, es el argumento primario contra contratar in house.

### 3.10 El esquive sistemático del precio

No existe `/pricing/`. Ninguna de las nueve páginas censadas publica un monto. El mecanismo de esquive es siempre el mismo: convertir la pregunta de precio en porcentaje de ahorro relativo (*"30-50% cost savings"*, con la coletilla *"no recruiting fees, no benefits overhead"*) o remitir a conversación (*"happy to discuss in more detail"*). Nunca silencio total: siempre una respuesta que suena a respuesta.

### 3.11 FAQ como capa de objeciones, por página

Dos niveles. FAQ central (`/faq/`), corta y deliberadamente evasiva en lo operativo-legal: no responde nada sobre timezone exacto, IP, política de reemplazo, contratos ni facturación. Y FAQ local por página de producto, de 6 a 13 preguntas, con `FAQPage` schema. La de staff augmentation incluye la comparación explícita entre los tres modelos y el timeline de onboarding; la de outsourcing incluye jurisdicción legal (*"All contracts are with a US entity, under US legal jurisdiction"*) y, notablemente, contenido educativo no autopromocional (*"Look at their technical portfolio for relevant past work, interview their engineers directly, and ask for references"*).

### 3.12 Diferenciación de modelos por quién gestiona

El eje no es tamaño de equipo, es responsabilidad de gestión:

| Modelo | Quién gestiona el día a día | Frase ancla verbatim |
|---|---|---|
| Staff Augmentation | El cliente, directo | *"Slot senior engineers directly into your existing team... You retain full management control"* |
| Dedicated Team | Un PM de BairesDev, el cliente fija objetivos | *"You set project goals while the team manages day-to-day execution"* |
| Software Outsourcing | BairesDev entero | *"You define the outcomes and requirements. We take full ownership"* |

Ese bloque de tres frases aparece casi verbatim repetido en dedicated-team y en outsourcing, y en staff-augmentation vive dentro del FAQ. Sugiere que staff augmentation es la opción por defecto del funnel y las otras dos tienen que argumentar por qué no elegir la default.

### 3.13 Estructura humana visible

`/about/leadership-team/`: 33 ejecutivos con foto profesional, nombre y cargo. Más premios otorgados a personas nombradas (Nacho De Marco, Justice Erolin, Rocío Belfiore, Natalia Rodriguez). Responde "¿con quién estoy tratando, hay estructura o es una persona vendiendo?". La solidez se vende por transparencia de nombres.

### 3.14 Timeline de antigüedad

2009 a 2026, un hito por año, sin huecos. Genera sensación de inevitabilidad y momentum. Es prueba social por acumulación temporal, imposible de fabricar.

### 3.15 Aparato legal por volumen

Privacy Policy con 19 secciones y 16 apéndices por jurisdicción (GDPR, CCPA/CPRA, VCDPA, CPA, CDPA, PDPA argentina, más nueve estados). Terms & Conditions corto (~800 a 1000 palabras). Do Not Sell satélite. Banner de cookies con Decline All / Accept All. El peso legal está puesto casi todo en privacidad de datos, no en términos de servicio. Función: no convierte, respalda el formulario de lead gen.

### 3.16 Careers como prueba de empleador

`/join-us/` con beneficios concretos (2 semanas de vacaciones pagas, upskilling, horarios flexibles, cobertura de eventos de vida), testimonios de empleados con nombre, premios de employer branding separados de los de cliente, y bono de referido de hasta $1,300 USD. Responde una objeción indirecta del comprador B2B: si retienen talento, mi equipo asignado no rota.

### 3.17 Contenido sin gate

Whitepapers, case studies en PDF e infografías descargables SIN formulario. El único gate del sitio es "Schedule a Call" y el newsletter. Contradice el patrón B2B clásico de ebook a cambio de email, y baja la fricción de verificación.

### 3.18 Optimización para motores de respuesta

Botones "resumir con IA" (ChatGPT, Grok, Perplexity, Gemini, Claude) insertados dentro de los artículos de blog. `FAQPage` + `BreadcrumbList` como schema base repetido en tecnología, industria y blog. Están jugando GEO, no solo SEO.

### 3.19 El formulario como filtro de mínimo esfuerzo

`/start/basic-details/` pide tres cosas: nombre, email de trabajo, y un dropdown de servicio con las tres opciones descritas en una línea cada una. Todo lo complejo (presupuesto, alcance, seniority) se deja para la llamada. El botón que lleva ahí cambia de etiqueta según la página de origen ("Schedule a Call", "Jump-start My Project", "Connect With Us") pero el destino es siempre el mismo. Es reetiquetado de UI, no formularios distintos.

---

## 4. Cruce con los huecos de Paradius

Para cada uno de los once huecos del censo (secciones 8.1 a 8.11), qué hace BairesDev, un verbatim de ejemplo, y la recomendación.

Leyenda de recomendación: **(a)** replicar la estructura con voz propia, **(b)** resolverlo de forma boutique distinta, **(c)** ignorarlo con razón.

---

### 8.1 Página o sección de "cómo trabajamos" para el comprador

**Qué hace BairesDev.** Tiene tres capas para esto. El bloque de proceso de tres pasos, repetido en el home y en las cuatro páginas de servicio. Las fases más detalladas de outsourcing (Discovery, Onboarding, Development, Handoff). Y el bloque "Risk Management" de dedicated-team, con cinco pilares (Roadmap Alignment, Embedded Collaboration, Performance Management, Retention, Compliance). Cubre exactamente lo que Paradius no cubre: qué le pasa al cliente después de firmar.

**Verbatim de ejemplo.**

> *"Book a discovery call. Tell us more about your business on a discovery call. We'll discuss team structure and approach, success criteria, timescale, budget, and required skill sets to see how we can help."*

> *"In a matter of days, we will finalize your project specifications, agree on an engagement model, select and onboard your team."*

> *"Once we've agreed on milestones, we'll immediately get to work. We'll track progress, report updates, and continuously adapt to your needs."*

Y el compromiso duro, del FAQ de staff augmentation:

> *"It typically takes about 2 weeks, sometimes up to 4 for larger teams... Compare that to traditional hiring, where recruiting, interviewing, and onboarding a single engineer typically takes 3-6 months."*

**Recomendación: (a) replicar la estructura con voz propia. Prioridad máxima.**

Este es el hueco más caro de todos, porque el canon v3 tiene una sección "THE ENGINE" que habla de cómo Paradius forma ingenieros y ni una línea de qué le pasa al comprador. El comprador corporativo pregunta esto siempre.

Tres piezas concretas, y las tres ya tienen copy muerto rescatable en el propio censo:

1. **Un proceso de tres pasos con tiempo declarado.** Paradius ya tiene un compromiso de tiempo mejor que el de BairesDev y no lo usa como proceso: `"Profiles presented within 48 hours"` y `"we reply within 24 hours"`. Eso es un contraste de tiempo más agresivo que las 2 a 4 semanas de BairesDev. Falta narrarlo como secuencia, no como nota al pie del catálogo.
2. **Qué pasa si el ingeniero no funciona.** El censo lo marca como la objeción número uno sin respuesta, y la línea que la responde ya está escrita en copy muerto de home-v4: `"context is continuously distributed across multiple team members, ensuring immediate gap-filling and zero-friction transitions when scaling talent"`. Traducida al registro narrativo, es el bloque de continuidad.
3. **Quién es el punto de contacto.** Acá la boutique gana por default y conviene decirlo: en BairesDev el contacto es un account manager de una empresa de 4.000 personas. En Paradius es la misma persona que evaluó al ingeniero. Eso no necesita métricas para ser cierto.

No copiar el nombre "Risk Management" ni la estructura de cinco pilares. Copiar la función: el comprador tiene que poder leer, en una pantalla, qué pasa el día después de firmar.

---

### 8.2 Pricing y modelo comercial

**Qué hace BairesDev.** No publica precio en ninguna de las nueve páginas censadas, ni existe `/pricing/`. Pero nunca guarda silencio: siempre responde con un porcentaje de ahorro relativo o con una remisión a conversación. La pregunta de precio tiene una respuesta en el sitio, aunque no sea un número.

**Verbatim de ejemplo.**

> *"30-50% Cost Savings"* con la coletilla *"no recruiting fees, no benefits overhead"*

Y del FAQ central, la única vez que el sitio contesta directo la pregunta de costo:

> *"How much does nearshore engineering cost compared to local hiring?"* con respuesta de 30 a 50% menos que contratación en EE.UU. con calidad senior comparable.

Y cuando quiere esquivar del todo, lo dice: *"happy to discuss in more detail"*.

**Recomendación: (b) resolverlo de forma boutique distinta.**

D1 es permanente y correcta: `"Rates are never public."` No hay que revocarla. El hueco real que marca el censo no es el precio, es que el sitio no explica por qué no hay precio, desde que se borró la línea de `ContactForm`: `"No pricing on the site; we scope rates in private conversation."`

Lo boutique acá no es imitar el "30-50%" (Paradius no tiene datos para sostener ese porcentaje y sería exactamente el tipo de número inventado que el canon prohíbe). Lo boutique es la honestidad como diferenciador, que ya es un valor declarado del dueño. Una sola línea en `/contact` diciendo que cada engagement se cotiza contra la arquitectura real y que las tarifas se discuten en conversación privada hace tres cosas: responde la pregunta, explica la política, y suena a boutique en vez de a evasión.

Segundo elemento: la unidad comercial. `engine.astro` tiene enterrado `"standard US-nearshore rate structures"`, que es la señal de rango sin ser un número. Si sobrevive a la limpieza de jerga, esa frase merece salir del mockup.

Lo que NO hay que hacer: una calculadora de ahorro como la de `/technologies/python/hire-developers/`. Necesita cifras de referencia que Paradius no puede sostener.

---

### 8.3 About / quiénes somos

**Qué hace BairesDev.** Tres páginas. `/about-us/` con origen, cifras, valores, timeline 2009 a 2026 y testimonios. `/about/leadership-team/` con 33 ejecutivos con foto y cargo. `/press/` con comunicados propios. La solidez se vende por transparencia de nombres y por antigüedad acumulada.

**Verbatim de ejemplo.**

> *"For over a decade we've partnered with technology leaders to rapidly scale their teams and meet their business challenges."* con el subhead *"We think we're pretty good at it"*

> *"From humble beginnings to global partner."* y *"Fully remote before fully remote was trendy"*

Y la cita del Chairman en Leadership Team:

> *"BairesDev hires great people from a wide variety of backgrounds, which simply makes our company stronger, and we couldn't be prouder of that."*

**Recomendación: (b) resolverlo de forma boutique distinta. Prioridad alta.**

Este es el hueco con más tensión interna del censo, y hay que desarmarla antes de decidir. La ley de voz prohíbe `"its founder"` en la confesión. Eso es una regla sobre CÓMO se dice la confesión, no una prohibición de que exista una página que diga quién dirige Paradius. El censo ya lo marca: "eso es una regla sobre la confesión, no sobre la existencia de un about".

BairesDev usa 33 caras para probar estructura. Paradius no tiene 33 caras y no debe fingirlas. Pero tiene algo que BairesDev NO tiene y que su propio mito ya declara: una persona identificable que responde por todo. El mito lo dice literalmente: `"Paradius soy yo. La tenacidad de lograr crear un mundo mejor."` y `"Que tiene Paradius que ningun competidor pueda decir? Me tiene a mi."`

La inversión estructural es exacta: BairesDev pone 33 nombres arriba y 4.000 anónimos abajo. Paradius pone un nombre arriba y códigos abajo. Es la misma arquitectura de confianza con el signo dado vuelta, y es coherente con el mito (el soberano de las sombras es uno, los ingenieros desaparecen dentro del éxito del cliente).

Datos mínimos que la página debe contener y que hoy solo viven en JSON-LD invisible: quién dirige, desde cuándo opera, dónde está registrada, dónde está el hub físico (aparece cinco veces como `"our hub"` sin ubicarse jamás), y cuánta gente es en orden de magnitud. Si el tamaño incomoda, se resuelve con el ángulo que el propio corpus ya escribió: `"We never measure our strength by developer headcount, but by the density and caliber of our output."`

Lo que NO hay que copiar: el timeline por año. Paradius tiene `foundingDate: "2026"`. Un timeline con un hito es peor que ningún timeline.

---

### 8.4 FAQ / objeciones

**Qué hace BairesDev.** Dos niveles. FAQ central corta en `/faq/`, y FAQ local de 6 a 13 preguntas al pie de cada página de producto, con `FAQPage` schema. Notable por ausencia: la FAQ central NO responde IP, reemplazo de developers, tipos de contrato ni facturación. Esos temas, cuando aparecen, están dispersos.

**Verbatim de ejemplo.**

Preguntas exactas del FAQ central que sí importan:

> *"What's the difference between staff augmentation, dedicated teams, and outsourcing?"*
> *"How does BairesDev ensure engineer quality?"*
> *"Does BairesDev integrate with our existing tools and workflows?"*

Y del FAQ de outsourcing, la única respuesta legal concreta del sitio:

> *"All contracts are with a US entity, under US legal jurisdiction"*

**Recomendación: (a) replicar la estructura con voz propia. Prioridad muy alta, y es la pieza de mejor retorno por esfuerzo de todo el informe.**

Paradius nunca tuvo FAQ en ninguna era. Es el hueco más barato de llenar y el que más objeciones cierra por línea escrita. Y acá conviene hacer lo CONTRARIO de BairesDev: BairesDev deja fuera de su FAQ central justamente los temas operativo-legales (IP, NDA, reemplazo, contrato, facturación) porque a esa escala son negociación de procurement. Para una boutique, esos temas son exactamente donde el comprador duda, y responderlos por escrito es lo que separa "un tipo con una web" de "una empresa".

Las preguntas que el censo ya identifica como sin responder, y que deben estar: solapamiento horario, idioma, contratación y facturación, propiedad intelectual, NDA, qué pasa si el ingeniero renuncia, período de prueba, cómo se reemplaza a alguien. A esas hay que sumar dos propias de Paradius: por qué los ingenieros tienen códigos en vez de nombres (ver 8.11), y por qué no hay precios (ver 8.2).

Nota de arquitectura: el `FAQPage` + `BreadcrumbList` schema es, según el capítulo de SEO, el ítem de mayor retorno técnico por esfuerzo mínimo de todo lo censado. Cuesta poco y aparece en resultados de búsqueda. Vale aunque el mito diga que nadie llega por búsqueda.

Nota de voz: la FAQ es el único lugar donde el registro puede ser plano y funcional sin traicionar el canon. El canon gobierna el home. Una FAQ escrita en voz mítica sería ilegible y contraproducente.

---

### 8.5 Testimonios y prueba social

**Qué hace BairesDev.** Fusiona logos y casos en una sola página larga (`/clients/`, que es la misma que `/case-studies/`): hero con stats, tres destacados, grilla alfabética de ~70 a 100 logos reales, reviews de Clutch embebidas, CTA de cierre. Cero anonimización. Testimonios con nombre propio, cargo y empresa, cada uno enlazando a su caso.

**Verbatim de ejemplo.**

> Rolls-Royce: *"BairesDev assembled a dream team for us and in just a few months our digital offering was completely transformed."*

> Associated Press: *"From our very first meeting with the team at BairesDev, we were confident we'd selected the best partner."*

> Urban Outfitters (Director of Technology, URBN): *"When the management team at BairesDev described the way their screening process verified technical and language proficiency we were optimistic. After interviewing the team we knew we had the right partner."*

**Recomendación: (c) ignorar la parte de testimonios atribuidos, con razón. (a) replicar la estructura de la página de caso individual.**

Hay que separar dos cosas que el censo agrupa en un solo hueco.

**Los testimonios atribuidos: ignorar.** El censo lo dice bien: está estructuralmente bloqueado. D3 prohíbe nombres de clientes en cualquier parte del sitio, y la ley de las pruebas prohíbe el framing de rescate. Un testimonio atribuido es incompatible con las dos reglas a la vez. Y hay una razón más fuerte que la compatibilidad: un testimonio anónimo (*"un director de tecnología de un retailer Fortune 500 dice que..."*) no prueba nada y sí levanta sospecha. Es peor que no tener. Este hueco no se llena, se declara cerrado por decisión de producto.

**La estructura de caso individual: replicar.** Acá sí. La plantilla de BairesDev (About, Challenge, Solution, Outcome, cita, CTA contextual) funciona igual de bien con dos casos que con sesenta, y Paradius YA tiene esa estructura en `/work/[slug]` con las secciones `"Problem"`, `"Solution"`, `"Outcome"` y `"What we left behind"`. Lo que falta no es estructura, es el copy aprobado que reemplace lo vetado.

Dos importaciones concretas de la plantilla de BairesDev que Paradius no tiene:

1. **La barra de key stats operativos** (tamaño de equipo, duración del engagement, stack, modelo). BairesDev la usa para que el comprador se dimensione: si Google puso 20, yo pongo 3. Y es honesta: no es una métrica de resultado inventada, es un hecho del engagement. Compatible con la prohibición de números inventados, porque son datos reales del trabajo, no impacto atribuido.
2. **El CTA contextual de cierre.** BairesDev usa *"Facing similar challenges to [Cliente]? See how we can help."* Paradius no puede nombrar al cliente, pero sí el problema: el mismo mecanismo de espejo funciona con "si tu operación se parece a esto".

Y una advertencia del censo de BairesDev que confirma el criterio de Gabriel: la mayoría de sus casos NO tiene porcentaje de negocio. Google y Rolls-Royce miden por alcance operativo. La regla de Paradius (`"No invented metrics, ever."`) no es una desventaja competitiva: es lo que el líder de la categoría hace en dos de cada tres casos.

---

### 8.6 Legal: privacidad, términos, cookies

**Qué hace BairesDev.** Privacy Policy de 19 secciones con 16 apéndices por jurisdicción (GDPR, CCPA/CPRA, VCDPA, CPA, CDPA, PDPA argentina, más nueve estados), Terms & Conditions corto, página satélite de Do Not Sell, y banner de cookies con Decline All / Accept All. No hay policy de cookies separada: vive dentro de la privacy.

**Verbatim de ejemplo.**

> *"BairesDev LLC uses third-party tracking technologies, including cookies, web beacons and pixels, to personalize your visit to our website, perform marketing, collect analytics, and continuously improve your experience on our website and the services we offer. Read full statement"*

**Recomendación: (a) replicar la estructura, en versión mínima. Prioridad absoluta, es lo primero que hay que hacer.**

El censo de Paradius lo llama "el hueco más urgente" y tiene razón: hay un formulario en producción que recoge nombre, email, empresa y mensaje, y los manda a un backend, sin ninguna política de privacidad. Para cualquier revisión de compliance corporativa esto es bloqueante, y para un comprador europeo es descalificante.

Lo que hay que replicar es la EXISTENCIA de las páginas y los links en el footer, no el volumen. Los 90 y pico de párrafos con 16 apéndices son sobreingeniería para el tráfico y el riesgo de una boutique. Tres piezas cortas alcanzan: qué datos se recogen en el formulario, para qué se usan, cómo se borran y a quién se escribe para pedirlo; términos de uso del sitio; y, si se agrega analítica, un aviso de cookies. La honestidad como valor declarado juega a favor: una política corta y legible es más creíble en una boutique que un documento de 90 párrafos copiado de una plantilla.

Nota de estilo: son las únicas páginas del sitio donde el canon narrativo no aplica en absoluto. Registro legal plano, sin mito.

---

### 8.7 Carreras / lado ingeniero

**Qué hace BairesDev.** `/join-us/` con hero (*"Innovate, from **Anywhere.**"*), beneficios concretos, testimonios de empleados con nombre, premios de employer branding separados de los de cliente, departamentos, aplicación abierta sin vacante, y bono de referido de hasta $1,300 USD. Además filtra testimonios de empleados a `/about-us/`, mezclando prueba social de cliente y de empleador en la misma página institucional.

**Verbatim de ejemplo.**

> *"At BairesDev, we don't just get the job done—we redefine what's possible."*

> *"Work with household names like Google, Pinterest, and Rolls-Royce, as well as game-changing startups that are shaping the future."*

> *"We don't just fill vacancies."* (bloque de Open Application)

**Recomendación: (b) resolverlo de forma boutique distinta. Prioridad media, pero es la página más barata del informe.**

El censo lo dice: es la página más fácil de armar porque el copy ya está escrito, disperso en copy muerto. Solo hay que decidir que existe. Piezas ya redactadas y aprobadas en algún momento:

- `"For engineers: a place where your spark is an asset, not a liability."`
- `"Designed by an engineer, for engineers."`
- `"performance-driven bonuses, and ongoing training in multicultural communication, language skills, and platform adaptation"`
- `"We do not hire headcount. We find the ones with the spark and push them further than they believed they could go."` (canon v3)
- El hub con mentor senior y la transición a remoto sin degradación.

Por qué boutique y no réplica: BairesDev vende trabajar ahí como acceso a logos grandes y beneficios de empresa grande. Paradius vende lo opuesto y ya lo tiene escrito: presión, mentoría directa, y alguien que te empuja más lejos de lo que creías. Eso no es un beneficio de HR, es una promesa personal. No necesita portal de aplicación ni departamentos ni bono de referido.

Y hay un beneficio lateral para el comprador, que es la razón real por la que esta página vale la pena: BairesDev pone employer branding en su about porque responde una objeción del comprador B2B (si retienen talento, mi equipo no rota). Paradius tiene el mismo argumento y más fuerte: `"Nobody here is disposable. Almost nobody leaves."` Una página de carreras es donde ese argumento se sostiene sin sonar a slogan.

---

### 8.8 Definición del servicio en términos del comprador

**Qué hace BairesDev.** Diferencia tres modelos por quién gestiona el día a día, no por tamaño. Cada modelo tiene página propia, y el bloque de comparación se repite dentro de dos de ellas. El dropdown del formulario de conversión describe los tres en una línea cada uno, lo que fuerza al visitante a elegir un modelo mental antes de escribir.

**Verbatim de ejemplo.** Las tres opciones exactas del dropdown de `/start/basic-details/`:

> *"Staff Augmentation — World-class software engineers embedded in your team"*
> *"Dedicated Teams — A dedicated autonomous engineering team"*
> *"Software Outsourcing — Tailored end-to-end tech solutions"*

Y la elasticidad sin SKU: *"Add two engineers or twenty"*, *"We can spin up dedicated teams of any size, for any workstream."*

**Recomendación: (a) replicar la estructura con voz propia, reducida a dos modelos. Prioridad alta.**

El censo marca que Paradius tiene la unidad de compra clara en los docs (`"staff augmentation — the client picks profiles — plus 'we assemble the full team for you' as a framing on top of the same catalog"`) y nunca la escribió como copy. El CTA `"Build your team"` insinúa la segunda opción sin explicarla jamás.

Eso ya son exactamente dos modelos, y calzan con los dos CTAs del canon v3 sin agregar ninguno:

| Modelo | Quién gestiona | CTA canónico existente |
|---|---|---|
| Elegís perfiles del registro | El cliente | `"Browse the registry"` |
| Armamos el equipo completo | Paradius | `"Start your team"` |

La arquitectura de BairesDev funciona acá sin ninguna adaptación forzada: dos intenciones, dos labels, un eje de diferenciación (quién gestiona). Y hay una línea de copy muerto que es la mejor explicación del modelo que Paradius escribió jamás, según el propio censo: `"Pick profiles, assemble your squad — we handle the rest."` Necesita reescritura para eliminar el em-dash, pero la formulación es la correcta.

Tercer modelo (proyecto cerrado tipo outsourcing): **no agregarlo**. Paradius no lo vende, y un modelo declarado que no se ejecuta es peor que no ofrecerlo.

---

### 8.9 Cobertura, zona horaria y ubicación operativa

**Qué hace BairesDev.** Tiene página dedicada al argumento (`/nearshore-outsourcing/`) más una tabla comparativa Nearshore contra Offshore contra Onshore repetida en las tres páginas de modelo. El eje se convierte en la única variable que importa.

**Verbatim de ejemplo.**

> *"Perks of proximity without the premium."* / *"Leave your software development to our LATAM professionals. Assemble a team of bilingual tech specialists in as few as 2-3 weeks."*

> *"Unlike offshore outsourcing, where significant time differences and cultural barriers can cause delays, nearshore outsourcing minimizes these challenges."*

> Del hero del home: *"Access 4,000+ **timezone-aligned**, AI-augmented software engineers across 100+ technologies."*

**Recomendación: (b) resolverlo de forma boutique distinta, sin página propia. Prioridad alta por costo cero.**

El problema de Paradius no es que falte la página, es que la palabra "nearshore" está en el SEO y en `/talent` sin decir nunca nearshore respecto a qué, ni desde dónde, ni en qué franja. Para un comprador estadounidense el solapamiento horario es criterio de decisión de primer orden, y hoy no tiene forma de evaluarlo.

Por qué NO replicar la tabla comparativa: el capítulo de servicios ya lo señala y es correcto. Paradius YA ES la respuesta nearshore. Construir una tabla donde nearshore le gana a offshore es competir contra sí mismo y regalarle al lector la idea de que hay alternativas más baratas.

Lo boutique es sustituir la tabla por un hecho: dónde está el hub, en qué franja horaria trabaja el equipo, y cuántas horas se solapan con la costa este y la oeste de EE.UU. Es un dato, no un argumento, y por eso es más fuerte. Ubicar el hub además cierra el otro problema que arrastra el censo: `"our hub"` aparece cinco veces en distintas versiones sin ubicarse jamás, lo que hace que el bloque más concreto del canon v3 (`"Every engagement begins in one room: our hub, a senior mentor at the next desk"`) suene a metáfora en vez de a lugar.

Ubicación natural: FAQ (una pregunta), About (una línea) y footer, junto a `"Registered in Wyoming, USA"`. No necesita página.

---

### 8.10 Página 404 y estados vacíos

**Qué hace BairesDev.** Nada que el censo haya capturado. No se relevó su 404 y el sitio no muestra estados vacíos porque su catálogo nunca está vacío. Es un hueco donde el líder de categoría no ofrece modelo.

**Verbatim de ejemplo.** No hay. Lo más cercano es la evidencia negativa de rutas rotas del propio BairesDev: `/awards/`, `/security/`, `/pricing/` y `/resources/` devuelven 404, y `/software-development/` sirve una landing vieja con copy divergente. Un sitio a esa escala acumula rutas muertas y no las cura.

**Recomendación: (b) resolverlo de forma boutique distinta. Prioridad baja para el 404, media para el estado vacío.**

El 404 es higiene: existe o no existe, y cuesta una hora. Pero acá hay un argumento de identidad que lo hace más que higiene. El mito dice que el sitio tiene un solo trabajo: `"to be remembered. 'At least interesting. At least different.'"` Un 404 es la única página del sitio donde el visitante ya está desorientado y por lo tanto atento. Es el lugar más barato del sitio para ser memorable.

El estado vacío del catálogo es más serio y es riesgo real, no estético: el plan advierte verbatim que `"/talent is empty in API mode until the database has published developers"`. Un catálogo que se lee "Registry: 0 active profiles" el día del DNS swap destruye más credibilidad que la que construye el home entero. Necesita copy antes del lanzamiento, y el copy correcto no es "no hay perfiles": es la ruta alternativa, `"Start your team"`, que es la que Paradius quiere de todos modos.

---

### 8.11 Explicación del sistema de códigos

**Qué hace BairesDev.** Muestra perfiles de ejemplo con nombre y inicial, años de experiencia, stack y ciudad (Sofia G., Henrique S., Marco A.; Alejandro F. de San Salvador, Maria E. de Lima, Carlos R. de Montevideo, Patricia L. de Buenos Aires), tres o cuatro por página, en formato idéntico repetido. No explica nada porque no hay nada que explicar: son placeholders que prueban "tenemos gente así disponible" sin comprometerse a nada verificable. No hay foto, LinkedIn ni forma de verificar que existan.

**Verbatim de ejemplo.** El único texto que enmarca los perfiles es genérico: *"best-fit software developers according to your requirements"*. La identidad del ingeniero es, en todo el dominio, una cifra agregada: *"Access 4,000+ timezone-aligned, AI-augmented software engineers"*.

**Recomendación: (a) replicar la posición estructural, invirtiendo el contenido. Prioridad alta, y es el punto donde Paradius gana de verdad.**

Este es el hallazgo más aprovechable de todo el sondeo. BairesDev y Paradius hacen exactamente lo mismo (mostrar ingenieros sin identidad real) por razones opuestas: BairesDev anonimiza porque a 4.000 personas no hay identidad que mostrar. Paradius anonimiza por diseño, y tiene una razón que puede decir en voz alta.

Hoy la razón está partida en dos lugares y ninguno la explica al comprador. El canon v3 la usa como momento poético del cierre: `"Our engineers carry codes instead of names. Your systems carry no signature of ours."` Y los docs tienen la parte operativa que el comprador necesita: `"full identity is only disclosed later in the deal, off-platform"`. El censo lo dice con precisión: esa frase de los planes es exactamente el copy que falta en la página.

Lo que hay que agregar es un bloque corto en `/talent`, y una pregunta en la FAQ, que responda tres cosas: por qué códigos, cuándo se conoce la identidad real, y qué se puede verificar antes (stack, años, experiencia anonimizada, idiomas, todo lo que ya está en el perfil). Registro plano, no mítico: el momento poético es del home, la explicación operativa es del catálogo.

Ventaja competitiva concreta que esto habilita: los perfiles de BairesDev son inverificables por diseño. Los de Paradius son verificables en una llamada, porque son personas reales con un código. Decir eso convierte la anonimización de sospecha en política.

---

## 5. Lo que NO hay que copiar

Patrones que dependen de escala o que matarían la identidad de Paradius.

| Patrón de BairesDev | Por qué no |
|---|---|
| **Cifras de volumen** (4.000+ ingenieros, 500+ clientes, 1.480+ proyectos, 2,5M aplicantes/año, 160+ awards) | Es la base entera de su credibilidad y Paradius no tiene el sustrato. Copiar la mecánica en miniatura ("15+ clientes", "8 ingenieros") no lee como solidez: lee como impostura, e invita a la pregunta "¿y ustedes cuántos vetean?". Además choca de frente con `"No invented numbers, no fake precision"`. |
| **La fábrica de páginas hire por tecnología** (77 slugs por 2 plantillas, 30 industrias) | Inversión de contenido y SEO de años que asume equipo de content dedicado. Y el mito de Paradius ya lo descartó por otra vía: `"No voy a conseguir ningun cliente por posicionamiento en redes ni busquedas."` Producir 60 páginas para un canal que el dueño declaró irrelevante es el peor uso posible del tiempo antes del deadline. |
| **La grilla de 70 a 100 logos de clientes** | D3 lo prohíbe (`"No client names anywhere on the site."`) y no hay volumen. Tres logos anónimos en una grilla se ven como una grilla vacía. |
| **Los premios y rankings** (Inc. 5000, Clutch, IAOP, Globee, Stevie) | Requieren historial de revenue y procesos de nominación. Una empresa con `foundingDate: "2026"` no aplica. Un bloque de awards con cero entradas o con premios comprados es peor que no tenerlo. |
| **El aparato de prensa** (`/press/`, "As featured in", Harvard, Stanford, SXSW, Davos) | Acumulado en 15+ años de PR activo. No es fabricable ni razonable de perseguir. Un bloque "As featured in" vacío o con blogs menores destruye más credibilidad de la que aporta. |
| **El timeline 2009 a 2026** | Prueba social por antigüedad pura. Paradius tiene un año de historia. Copiar el bloque vacío es contraproducente. |
| **El grid de 33 ejecutivos** | Es exactamente lo opuesto al modelo Paradius. La FUNCIÓN (dar sensación de estructura) hay que resolverla de otra forma, ver 8.3. |
| **El grid de 19 certificaciones** | Es "tenemos muchos empleados certificados en muchas cosas". Para un fundador único, uno o dos compromisos concretos explicados en una frase pesan más que 19 logos. |
| **La Privacy Policy de 90 párrafos con 16 apéndices** | Sobreingeniería para el volumen de tráfico y riesgo de una boutique. La función se logra con una política corta y clara. |
| **La tabla Nearshore vs Offshore vs Onshore** | Paradius ya ES la respuesta nearshore. Poner la tabla es competir contra sí mismo y sembrar la idea de que hay opciones más baratas. |
| **El portal de careers corporativo** (departamentos de HR/Marketing/Sales, bono de referido de $1,300) | No hay operación que lo sostenga. Una página de carreras de una boutique es una promesa personal, no un ATS. |
| **Los tres modelos de engagement** | Paradius vende dos. El tercero (proyecto cerrado end to end) declarado pero no ejecutado es un pasivo. |
| **La repetición literal de bloques entre páginas** | A escala de BairesDev es eficiencia industrial. A escala boutique el visitante lee dos páginas completas y ve el copy repetido: lee como plantilla comprada, que es exactamente lo contrario de `"Every line must be something no other agency could sign."` |
| **Los perfiles placeholder tipo "Sofia G., 8 años, Lima"** | Paradius tiene perfiles reales con códigos. Imitar el formato de placeholder anónimo tira a la basura su única ventaja verificable. |
| **La calculadora de ahorro nearshore** | Necesita cifras de referencia que Paradius no puede sostener sin inventar. |
| **La inconsistencia de cifras entre páginas** (1M vs 2,5M) | No es un patrón, es su deuda. En un sitio de siete páginas, una contradicción así se ve en el primer minuto. |
| **La voz institucional entera** | Todo el home de BairesDev es "somos la opción grande y segura". El mito de Paradius es lo contrario y está explícito: `"Lo que debe hacer mi pagina es imprentarse en la memoria de la gente."` Copiar el tono anula la única ventaja que tiene. La estructura se importa; la voz, nunca. |

**Resumen de la línea divisoria**: de BairesDev se copia el ESQUELETO (qué preguntas responde el sitio, en qué orden, en qué página) y se descarta el RELLENO (con qué las responde, que en su caso siempre es volumen). Lo que hace sólido a BairesDev es tener una respuesta para cada pregunta del comprador en un lugar predecible. Eso no cuesta escala: cuesta decidir.

---

## 6. Esqueleto propuesto

Lista mínima de páginas y secciones para que una boutique de un fundador se lea sólida, ordenada por impacto sobre la decisión de compra. Solo estructura y qué pregunta del comprador responde cada pieza. Sin copy.

### Bloque 1: bloqueantes (sin esto, un comprador corporativo no avanza)

**1. Páginas legales: privacidad, términos, y aviso de cookies si hay analítica.**
Responde: "¿qué hacen con mis datos si les dejo mi email?" y "¿esta empresa pasó por alguna revisión?". Hueco 8.6. Es lo único del informe que bloquea una venta por sí solo, porque hay un formulario en producción recogiendo datos sin política. Tres páginas cortas, linkeadas desde el footer. Registro legal plano.

**2. FAQ, página propia con schema `FAQPage`.**
Responde, en un solo lugar: solapamiento horario, idioma, contrato y facturación, propiedad intelectual, NDA, qué pasa si el ingeniero se va, período de prueba, cómo se reemplaza, por qué no hay precios, por qué los ingenieros tienen códigos. Huecos 8.4, 8.2, 8.9, 8.11. Máximo retorno por línea escrita de todo el informe: es donde el comprador de una boutique deja de dudar, y es exactamente lo que BairesDev deja sin responder.

**3. Sección "cómo trabajamos con vos" en el home o página propia.**
Responde: "¿qué pasa el día después de firmar?". Kickoff, cadencia de reporte, punto de contacto único, qué pasa si alguien no funciona, cómo se escala o se reduce. Hueco 8.1. Tres pasos con el tiempo declarado que Paradius ya promete (24 horas de respuesta, 48 horas de perfiles), que es un compromiso más agresivo que las 2 a 4 semanas de BairesDev y hoy está escondido en una nota al pie.

### Bloque 2: estructura de confianza (lo que convierte "un tipo" en "una empresa")

**4. Página About.**
Responde: "¿con quién estoy tratando, hay alguien que responde por esto?". Quién dirige, desde cuándo, dónde está registrada, dónde está el hub, orden de magnitud del equipo. Hueco 8.3. Inversión deliberada del modelo BairesDev: ellos ponen 33 caras arriba y 4.000 anónimos abajo; Paradius pone un nombre arriba y códigos abajo. La ley de voz gobierna la confesión del home, no la existencia de esta página.

**5. Definición de la unidad de compra, dos modelos, en el home y en `/talent`.**
Responde: "¿qué estoy comprando exactamente: una persona, un equipo, un proyecto?". Hueco 8.8. Eje de diferenciación: quién gestiona el día a día. Calza exacto con los dos CTAs canónicos existentes (`"Browse the registry"` y `"Start your team"`) sin agregar labels nuevos. Dos modelos, no tres.

**6. Explicación del sistema de códigos, bloque en `/talent` más una entrada en la FAQ.**
Responde: "¿por qué no veo quién es esta gente, y cuándo lo voy a ver?". Hueco 8.11. Convierte la anonimización de sospecha en política, y es la única pieza del sitio donde Paradius tiene una ventaja verificable sobre BairesDev, cuyos perfiles son inverificables por diseño.

**7. Reescritura de los dos casos de `/work`, con barra de datos operativos del engagement.**
Responde: "¿qué hicieron en concreto y cómo dimensiono esto para mí?". Hueco 8.5, mitad estructural. La plantilla ya existe (`Problem`, `Solution`, `Outcome`, `What we left behind`); falta el copy aprobado que reemplace lo vetado, más dos importaciones de BairesDev: datos operativos reales del engagement (tamaño, duración, stack, modelo), que no son métricas inventadas, y CTA contextual de espejo al cierre. Requiere aprobación del dueño para el copy final.

### Bloque 3: superficie y borde (barato, cierra el conjunto)

**8. Página de carreras.**
Responde, para el ingeniero: "¿por qué trabajaría acá?". Y para el comprador, de rebote: "¿su gente se queda?". Hueco 8.7. Es la pieza más barata del informe: el copy ya está escrito y disperso en el censo, solo hay que decidir que la página existe.

**9. Estado vacío del catálogo y página 404.**
Responde: "¿esto está vivo o abandonado?". Hueco 8.10. El estado vacío es riesgo real de lanzamiento, no estética: el plan advierte que `/talent` está vacío en modo API hasta que haya perfiles publicados, y un catálogo en cero el día del DNS swap destruye más credibilidad que la que construye el home. El 404 es la única página donde el visitante ya está atento, y el mito pide ser memorable.

**10. Alineación de SEO y JSON-LD con el canon vigente.**
Responde: qué ve el comprador cuando le pasa el link a un colega o cuando el link cae en un LLM. Deuda 4 del anexo, no es uno de los once huecos, pero el sondeo lo vuelve urgente: BairesDev optimiza activamente para motores de respuesta (botones de resumen con IA, `FAQPage` + `BreadcrumbList` en todo). El SEO de Paradius sigue describiendo una consultora genérica de dos reescrituras atrás, con em-dashes prohibidos incluidos. Agregar `FAQPage` y `BreadcrumbList` es, según el capítulo de contenido, el ítem de mayor retorno técnico por esfuerzo mínimo de todo lo censado.

---

### Nota final sobre el orden

Los tres primeros ítems son los que hacen que el sitio pase una revisión de compra. Los cuatro del medio son los que hacen que el comprador entienda qué compra y a quién. Los tres últimos cierran los bordes.

Ninguno de los diez requiere escala, logos, premios, prensa ni volumen de contenido. Todos requieren decidir y escribir una vez. Esa es la diferencia real entre bairesdev.com y paradius.dev hoy: no es que BairesDev tenga 4.000 ingenieros. Es que tiene una respuesta, en un lugar predecible, para cada pregunta que un comprador se hace antes de firmar.
