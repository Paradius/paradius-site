"""Set the tagline in Paradius Dawn as one compound SVG path, with solid and hollow words.

Usage: ~/.venvs/paradius/bin/python scripts/lockup-gen.py <out_dir>
(venv: python3 -m venv --system-site-packages ~/.venvs/paradius && ~/.venvs/paradius/bin/pip install pyclipper)
"""
import sys
from pathlib import Path

import pyclipper
from fontTools.pens.recordingPen import RecordingPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "public/assets/ParadiusDawn-Regular.woff2"
TRACK = -15
H, S = True, False

# (indent, [(word, hollow), ...]) per line
LOCKUPS = {
    "wide": dict(
        lines=[
            (0, [("FROM", S), ("ROOTS", H), ("WE", S), ("BUILD", H)]),
            (0, [("THE", H), ("DAWN", S), ("WE", H), ("RAISE", S)]),
        ],
        size=46, leading=53, align="center", stroke=50, gap=12,
    ),
    "mobile": dict(
        lines=[
            ([("FROM", S)], [("ROOTS", H)]),
            ([("WE", S)], [("BUILD", H)]),
            ([("THE", H)], [("DAWN", S)]),
            ([("WE", H)], [("RAISE", S)]),
        ],
        size=30, leading=30, align="spine", stroke=50, gap=8, symmetric=False,
    ),
}

font = TTFont(FONT)
cmap = font.getBestCmap()
glyphs = font.getGlyphSet()
hmtx = font["hmtx"]
UPM = font["head"].unitsPerEm


def contours(name):
    pen = RecordingPen()
    glyphs[name].draw(pen)
    out, cur = [], []
    for op, args in pen.value:
        if op == "moveTo":
            cur = [args[0]]
        elif op == "lineTo":
            cur.append(args[0])
        elif op == "curveTo":
            p0, (p1, p2, p3) = cur[-1], args
            for i in range(1, 9):
                t = i / 8
                m = 1 - t
                cur.append((m**3*p0[0] + 3*m*m*t*p1[0] + 3*m*t*t*p2[0] + t**3*p3[0],
                            m**3*p0[1] + 3*m*m*t*p1[1] + 3*m*t*t*p2[1] + t**3*p3[1]))
        elif op in ("closePath", "endPath"):
            if len(cur) > 2:
                out.append(cur)
            cur = []
    return out


def hollow_contours(polys, stroke):
    # the glyph XOR its eroded self, drawn with evenodd; clipper cleans the glitch cuts
    pc = pyclipper.Pyclipper()
    pc.AddPaths([[(int(x*10), int(y*10)) for x, y in p] for p in polys], pyclipper.PT_SUBJECT, True)
    clean = pc.Execute(pyclipper.CT_UNION, pyclipper.PFT_NONZERO, pyclipper.PFT_NONZERO)
    po = pyclipper.PyclipperOffset()
    po.AddPaths(clean, pyclipper.JT_MITER, pyclipper.ET_CLOSEDPOLYGON)
    eroded = po.Execute(-stroke * 10)
    return [[(x/10, y/10) for x, y in p] for p in clean + eroded]


def word_path(word, hollow, x, baseline, size, stroke, bbox):
    s = size / UPM
    d = []
    for ch in word:
        g = cmap[ord(ch)]
        polys = contours(g)
        for p in (hollow_contours(polys, stroke) if hollow else polys):
            pts = [(x + px*s, baseline - py*s) for px, py in p]
            for px, py in pts:
                bbox[0], bbox[1] = min(bbox[0], px), min(bbox[1], py)
                bbox[2], bbox[3] = max(bbox[2], px), max(bbox[3], py)
            d.append("M" + " ".join(f"{px:.2f} {py:.2f}" for px, py in pts) + "Z")
        x += (hmtx[g][0] + TRACK) * s
    return "".join(d), x


def advance(word, size):
    return sum(hmtx[cmap[ord(c)]][0] + TRACK for c in word) * size / UPM


def line_width(words, size, gap):
    return sum(advance(w, size) for w, _ in words) + gap * max(len(words) - 1, 0)


def draw_words(words, x, y, size, stroke, gap, d, bbox):
    for word, hollow in words:
        seg, x = word_path(word, hollow, x, y, size, stroke, bbox)
        d.append(seg)
        x += gap


def layout(lines, size, leading, align, stroke, gap, symmetric=True):
    d, y = [], size
    bbox = [1e9, 1e9, -1e9, -1e9]
    if align == "spine":
        # one gutter down the middle: left words end at it, right words start after it
        half = max(max(line_width(l, size, gap) for l, _ in lines),
                   max(line_width(r, size, gap) for _, r in lines))
        for left, right in lines:
            draw_words(left, half - line_width(left, size, gap), y, size, stroke, gap, d, bbox)
            draw_words(right, half + gap, y, size, stroke, gap, d, bbox)
            y += leading
        # symmetric: the gutter sits at the centre of the viewBox (over the trunk);
        # otherwise the block of text is what gets centred
        if symmetric:
            bbox[0], bbox[2] = 0, 2 * half + gap
        return "".join(d), bbox
    widths = [line_width(words, size, gap) for _, words in lines]
    total = max(i + w for (i, _), w in zip(lines, widths))
    for (indent, words), w in zip(lines, widths):
        x = indent if align == "left" else (total - w) / 2
        draw_words(words, x, y, size, stroke, gap, d, bbox)
        y += leading
    return "".join(d), bbox


def svg(d, bbox):
    x0, y0, x1, y1 = bbox
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.2f} {y0:.2f} {x1-x0:.2f} {y1-y0:.2f}">'
            f'<path fill-rule="evenodd" d="{d}"/></svg>\n')


if __name__ == "__main__":
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    for name, spec in LOCKUPS.items():
        d, bbox = layout(**spec)
        (out / f"lockup_{name}.svg").write_text(svg(d, bbox))
        print(f"{name}: {bbox[2]-bbox[0]:.1f} x {bbox[3]-bbox[1]:.1f}")
