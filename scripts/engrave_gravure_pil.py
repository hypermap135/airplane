#!/usr/bin/env python3
"""engrave_gravure_pil.py — pixel-perfect FR engraving via Pillow.

Gemini repeatedly mangled the spelling of "Personnalisez" no matter the
prompt. So instead we use the original Shopify image as base, sample the
wood colour, paint over the English engraving with that colour, then
draw the French engraving on top with PIL — 100% reliable spelling.
"""

import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SRC = Path(".tmp/preview/gravure-base-vide.png")
OUT = Path("public/images/gravure-personnalisee.png")

# Coords for the 1024x1024 Gemini base. The slanted wood face sits
# in the upper-middle band — text needs to land there.
TEXT_BOX = (220, 380, 760, 590)

LINE_1 = "Personnalisez votre"
LINE_2 = "modèle et votre nom"

# Engraving look: lighter than the wood (burnt + sanded), warm tone.
ENGRAVING_COLOR = (240, 215, 195, 255)   # light cream — engraved look

def find_font(size: int) -> ImageFont.FreeTypeFont:
    """Try a list of common system fonts; fall back to default."""
    candidates = [
        "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/System/Library/Fonts/Supplemental/Palatino.ttc",
        "/System/Library/Fonts/SFNS.ttf",
        "/Library/Fonts/Times New Roman.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    ]
    for p in candidates:
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size=size)
            except Exception:
                pass
    return ImageFont.load_default()


def sample_wood_colour(img: Image.Image, around: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    """Average the pixels just OUTSIDE the text box to grab the local wood tone."""
    # Sample a thin strip directly above the text region — same lighting
    x1, y1, x2, y2 = around
    strip = img.crop((x1, max(0, y1 - 30), x2, y1))
    pixels = list(strip.getdata())
    opaque = [p for p in pixels if (len(p) < 4 or p[3] > 200)]
    if not opaque:
        return (110, 60, 55, 255)   # rosewood fallback
    n = len(opaque)
    r = sum(p[0] for p in opaque) // n
    g = sum(p[1] for p in opaque) // n
    b = sum(p[2] for p in opaque) // n
    return (r, g, b, 255)


def paint_over_text(img: Image.Image, box: tuple[int, int, int, int], wood: tuple[int, int, int, int]) -> None:
    """Cover the existing English engraving with a softly-blurred wood patch
    so it blends seamlessly into the surrounding grain."""
    patch = Image.new("RGBA", (box[2] - box[0], box[3] - box[1]), wood)
    # Slight feather on the edges so the patch fades into the grain.
    mask = Image.new("L", patch.size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((10, 10, patch.size[0] - 10, patch.size[1] - 10), radius=18, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=18))
    img.paste(patch, (box[0], box[1]), mask)


def draw_engraving(img: Image.Image, box: tuple[int, int, int, int]) -> None:
    """Draw the two FR lines centered in the text box, with a subtle dark
    drop-shadow to read as an engraving rather than printed text."""
    draw = ImageDraw.Draw(img, "RGBA")
    bx1, by1, bx2, by2 = box
    cx, cy = (bx1 + bx2) // 2, (by1 + by2) // 2

    # Pick the largest font size that lets the longer line fit the box.
    longest = max(LINE_1, LINE_2, key=len)
    for size in range(54, 20, -2):
        font = find_font(size)
        w = draw.textlength(longest, font=font)
        if w <= (bx2 - bx1) - 60:
            break

    line_h = int(size * 1.30)
    total_h = line_h * 2
    y0 = cy - total_h // 2 + line_h // 2

    for i, text in enumerate((LINE_1, LINE_2)):
        w = draw.textlength(text, font=font)
        x = cx - w // 2
        y = y0 + i * line_h - size // 2
        # Inner darker shadow (carved depth)
        draw.text((x + 1, y + 1), text, font=font, fill=(60, 25, 20, 180))
        # Main light highlight (engraved face)
        draw.text((x, y), text, font=font, fill=ENGRAVING_COLOR)


def main():
    if not SRC.exists():
        sys.exit(f"missing source: {SRC}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img = Image.open(SRC).convert("RGBA")
    # The blank Gemini base has no existing text to mask — skip paint step.
    draw_engraving(img, TEXT_BOX)
    img.save(OUT, "PNG", optimize=True)
    print(f"  → {OUT}")


if __name__ == "__main__":
    main()
