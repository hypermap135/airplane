#!/usr/bin/env python3
"""Generate logo (512x512) and OG image (1200x630) for SEO.

Outputs:
  public/logo-512.png  — square brand mark Google uses in Knowledge Panel
                         and in the search-result favicon spot.
  public/og-image.png  — Open Graph card used when the URL is shared on
                         Facebook, WhatsApp, LinkedIn, Twitter, etc.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import sys


def load_font(size: int) -> ImageFont.ImageFont:
    """Find a usable bold font on the host."""
    for path in [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNS.ttf",
        "/Library/Fonts/Arial Bold.ttf",
    ]:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def draw_plane(draw: ImageDraw.ImageDraw, cx: int, cy: int, scale: float, fill):
    """Draw a stylized airplane silhouette centered at (cx, cy)."""
    # Polygon coords relative to a unit plane, scaled and translated.
    pts = [
        (-1.00,  0.00),  # tail tip
        (-0.70, -0.15),  # tail bottom
        (-0.30, -0.10),  # body bottom-left
        (-0.10, -0.45),  # left wing tip-bottom
        ( 0.05, -0.50),  # left wing tip
        ( 0.10, -0.10),  # body-wing joint
        ( 0.85, -0.05),  # nose-bottom
        ( 1.00,  0.00),  # nose
        ( 0.85,  0.05),  # nose-top
        ( 0.10,  0.10),  # body-wing joint top
        ( 0.05,  0.50),  # right wing tip
        (-0.10,  0.45),  # right wing tip-top
        (-0.30,  0.10),  # body top-left
        (-0.70,  0.15),  # tail top
    ]
    poly = [(cx + int(x * scale), cy + int(y * scale)) for x, y in pts]
    draw.polygon(poly, fill=fill)


def build_logo_512(out: Path):
    """Square brand mark: dark rounded background + airplane glyph."""
    size = 512
    img = Image.new("RGBA", (size, size), (10, 10, 25, 255))
    d = ImageDraw.Draw(img)

    # Subtle radial gradient background by drawing fading concentric rings
    for i in range(80, 0, -1):
        alpha = int(i * 1.2)
        d.ellipse(
            [size // 2 - i * 4, size // 2 - i * 4,
             size // 2 + i * 4, size // 2 + i * 4],
            outline=(58, 142, 255, min(alpha, 18)),
        )

    # Outer rounded square frame
    d.rounded_rectangle([20, 20, size - 20, size - 20],
                        radius=96, outline=(58, 142, 255, 120), width=3)

    # White/blue airplane silhouette
    draw_plane(d, size // 2, size // 2 - 12, 170, (255, 255, 255, 255))
    draw_plane(d, size // 2, size // 2 - 12, 170, None)  # outline pass
    # Add a soft cyan glow underline
    d.ellipse([size // 2 - 110, size // 2 + 60,
               size // 2 + 110, size // 2 + 80],
              fill=(58, 142, 255, 50))

    img.save(out, optimize=True)
    print(f"✓ {out} ({size}x{size}, {out.stat().st_size // 1024} KB)")


def build_og_image(out: Path):
    """1200x630 Open Graph card with brand + tagline."""
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), (4, 4, 16))
    d = ImageDraw.Draw(img)

    # Subtle grid pattern (very low contrast)
    grid_step = 80
    for x in range(0, W, grid_step):
        d.line([(x, 0), (x, H)], fill=(20, 28, 50), width=1)
    for y in range(0, H, grid_step):
        d.line([(0, y), (W, y)], fill=(20, 28, 50), width=1)

    # Diagonal soft blue glow on the right side
    for r in range(900, 200, -20):
        alpha_band = max(0, min(40, (900 - r) // 25))
        d.ellipse([W - r // 2, H // 2 - r, W + r // 2, H // 2 + r],
                  outline=(58, 142, 255, alpha_band))

    # Brand mark — airplane glyph, left side
    draw_plane(d, 220, 200, 140, (255, 255, 255))
    d.ellipse([220 - 90, 270, 220 + 90, 290], fill=(58, 142, 255))

    # Brand wordmark
    title_font   = load_font(82)
    tagline_font = load_font(34)
    label_font   = load_font(22)

    # "AIRPLANESTORE"
    d.text((110, 330), "AIRPLANE", font=title_font, fill=(245, 248, 255))
    d.text((110, 420), "STORE",    font=title_font, fill=(58, 142, 255))

    # Tagline
    d.text((110, H - 130),
           "Maquettes d'avion en résine premium.",
           font=tagline_font, fill=(180, 200, 230))

    # Bottom chip
    d.rounded_rectangle([110, H - 70, 540, H - 30], radius=20,
                        fill=(20, 30, 50), outline=(58, 142, 255), width=2)
    d.text((130, H - 62),
           "FAIT EN FRANCE  ·  LED INTÉGRÉ  ·  47 cm",
           font=label_font, fill=(180, 200, 230))

    # Right-side accent: vertical "tail-fin" mark
    d.rectangle([W - 80, 80, W - 40, 320], fill=(58, 142, 255))
    d.rectangle([W - 80, 320, W - 40, 350], fill=(255, 255, 255))

    img.save(out, optimize=True, quality=92)
    print(f"✓ {out} ({W}x{H}, {out.stat().st_size // 1024} KB)")


def main() -> int:
    out_dir = Path("public")
    out_dir.mkdir(exist_ok=True)
    build_logo_512(out_dir / "logo-512.png")
    build_og_image(out_dir / "og-image.png")
    return 0


if __name__ == "__main__":
    sys.exit(main())
