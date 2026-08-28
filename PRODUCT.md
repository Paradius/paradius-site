# Paradius — Product Brief (source of truth)

Read this before touching any visual, copy, or animation work on this site.
This file overrides generic design rules, plugin defaults, and any skill's
aesthetic preferences. Approved by Gabriel (owner) on 2026-08-27.

## What Paradius is

A staff-augmentation consultancy that is, in truth, one survivor's refusal to
give up, scaled into a company. Clients pick anonymous senior engineers
(codes, not names) or ask for a full team. The company's myth: the world was
made by two forces, Power and Will; Paradius unites them and then disappears
into the client's success ("sovereign of shadows"). The myth is not decoration.
It explains the product: anonymized engineers, no signature on the client's
systems, the client keeps the glory.

## The reader and the goal

Visitors do not arrive by search. They arrive because Gabriel wrote to them
directly. The page has ONE job: to be remembered. "At least interesting. At
least different." Honesty over political correctness, always. The buyer's
search keywords (staff augmentation, nearshore, senior engineers) must exist
on the page, but never as its voice.

## Visual law (non-negotiable)

- **The lockup is sacred.** "Architecting the Dawn from Within" (SVG, stencil
  circuit letterforms) is the hero, centered, with its dawn-rise animation.
  It is the tuning fork: everything else must rise to its strangeness, never
  dilute it.
- **Centered manifesto hero.** Anti-center rules from any skill do NOT apply.
- **Inverted scroll is deliberate.** Desktop wheel-down = ascend a circuit
  tree from roots to canopy. Never "fix" it.
- **Invisible spine, zigzag branches.** One node per row. Left column aligns
  right (text grows toward spine), right column aligns left.
- **Dark theme only.** bg #000, surface #0a0a0a, divider #1a1a1a, text #fff /
  #9ca3af, accent #c0c8d4 (cool silver). No other hues. Light comes from the
  accent family, never from color.

## The semantic axis: Power | Will

The spine is the axis between the two forces. Placement is meaning:

- **Left = Power**: system, architecture, proof, numbers, discipline.
  Voice: mono (`ui-monospace`, tracking 0.08em) and restrained Inter.
- **Right = Will**: people, the spark, manifesto statements.
  Voice: Cormorant Garamond.
- **Center = the unified**: hero, the assurance graft, the canopy (dawn),
  and confessional statements that belong to no side.

Never place a block by mechanical alternation. Which side a text appears on
must tell the reader what kind of truth it is.

## Typography rule

Typographic weight is proportional to what the line cost to say. The two
peaks of the page (monument scale, maximum air, their own light moment):

1. The confession ("...You will not find one that refuses to quit the way we do.")
2. The dawn ("The dawn is not ours. It is yours.")

Engine mechanics sit one register below. System voice (mono) is always small
and precise. A fourth jurisdiction exists: **Monumento** — the lockup's own
face (`ParadiusDawn-Regular.woff2`, @font-face 'Paradius Dawn') for SHORT
display lines in caps only (the POWER / WILL force labels). It is what makes
the page visually kin to the lockup; never use it for body or long lines. When a line stands alone, the whole viewport belongs to it: no
timid margins making the message a slave of the visual.

## The libreto (approved copy, v3)

Staging notes in brackets. This copy replaces all current home copy except
the lockup.

**[ROOTS — landing. Near-total darkness. Lockup + CTAs, nothing else. No subtitle.]**

CTAs: "Browse the registry" / "Start your team" (one label per intent,
reused verbatim everywhere).

**[NARRATIVE OPENER — first line of the ascent, center.]**

> Nobody arrives at Paradius by accident.

**[THE CONFESSION — center, a full viewport of its own. Typographic peak 1.]**

> You can find ten thousand agencies with better rankings, better funding,
> better manners. You will not find one that refuses to quit the way we do.

(Voice is "we", never "its founder". The line must assert superiority of
will, never read as "worse but stubborn".)

**[THE THESIS — first fork of the spine. Power falls left, Will falls right.]**

> Before it was a company, Paradius was a story: a world made by two forces.

- LEFT (Power): *Power: the architecture, the guardrails, the discipline
  that keeps systems from rotting.*
- RIGHT (Will): *Will: the spark. People who cannot leave things worse than
  they found them.*
- CENTER (close): *Every system that endures needs both. Most companies sell
  you one and call it engineering.*

**[THE ENGINE — trunk. Real mechanics, concrete images. No jargon strips.]**

- RIGHT (Will): *We do not hire headcount. We find the ones with the spark
  and push them further than they believed they could go.*
- LEFT (Power): *Every engagement begins in one room: our hub, a senior
  mentor at the next desk, standards enforced from day one.*
- LEFT (Power): *Then they go remote. And nothing degrades, because the
  discipline travels with them.*
- RIGHT (Will): *Nobody here is disposable. Almost nobody leaves.*
  [system footnote: `retention: ~100%`]

**[THE PROOFS — branches. One Will line opens; two fruits in narrated system
register. HINT the signature (things endure), NEVER state the "rescue"
framing: naming what things were before humiliates the people who lived it.
No invented metrics, ever.]**

> We leave systems better than we found them. Then they stay that way.

- *Warehouse automation: we built the visual language that lets robots,
  inventory and hundreds of services move as one. A Fortune 500 retailer now
  runs it across its network.*
- *Banking infrastructure: payments stopped going missing. Delays became
  guarantees. Those systems are still standing, years later, untouched by us.*

**[THE CANOPY — the dawn. Both forces merge at center. Maximum light of the
whole page. Typographic peak 2.]**

> The dawn is not ours. It is yours.
> Our engineers carry codes instead of names. Your systems carry no
> signature of ours. We build the morning; you keep it.
> That is the whole story of Paradius, and it ends the same way every time:
> we disappear into your success.

Registry teaser LEFT (Power: the codes), Work teaser RIGHT (Will: what was
achieved). CTAs reuse the two labels from the hero.

## Copy consistency debt

- `/work` and `src/content/fixtures/cases.json` still tell the old version
  with invented numbers (-31%, -26%) and a "fraud" outcome. They must be
  rewritten to match the proofs above (missing payments / delays /
  transaction security, adoption at scale). Owner approves all case copy.

## Animation law (validated 2026-08-27, do not regress)

Settle model invariants (see `src/scripts/home-v7.ts`):

1. Progress anchors on the LEADING edge (`rect.bottom`) — blocks are born
   the instant they enter the viewport.
2. Growth radiates from the spine-bottom corner (`transform-origin` right/
   left/center bottom + subtle uniform scale 0.94→1).
3. Settle velocity must EXCEED scroll flow: `BRANCH_PULL_Y_VH` (0.55) >
   `SETTLE_ENTRY_END` (0.45), or the ascent cancels and reads horizontal.
4. No artificial side phase (`SETTLE_SIDE_NUDGE = 0`): geometry orders births;
   whichever block hangs lower is born first.
5. Canopy end is a smooth RAMP to completion (last 0.3vh of scroll), never a
   snap — a hard `t = 1` made the final block jump mid-birth.

Vetoes (owner-rejected, do not re-propose): PowerPoint wipes / clip-path
curtains / one-shot staggers; scaleX stretch; visible text rotation;
bottom-hinge rotate; document-space measurement without the visual flip;
dashboard cards in the hero; forcing text timing to background-tree SVG paths.

## Text quality bar

- Zero em-dashes and en-dashes in visible copy. Restructure with periods,
  commas, colons.
- No invented numbers, no fake precision, no jargon strips
  ("sniping pipeline · network nodes") as content.
- Every line must be something no other agency could sign.
