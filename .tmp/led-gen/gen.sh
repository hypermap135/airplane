#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
: "${GEMINI_API_KEY:?missing key}"

SRC="a220-source.jpg"
PROMPT='Edit this exact photograph of an Airbus A220-300 Air France resin model on a stand. Keep the airplane silhouette, the AIRFRANCE livery, blue/white/red tail decals, registration F-CDG and the camera angle PIXEL-PERFECT identical. DO NOT regenerate the plane. Only modify lighting and environment: (1) Replace the beige/tan background with a deep dark studio environment, almost pure black with a very subtle dark grey gradient — NOT navy, NOT blue. (2) Turn ON the cabin lighting from inside: cockpit windscreen glows warm white-amber, every cabin window glows warm amber-white from inside as if the cabin lights are on. (3) ABSOLUTELY NO blue, cyan, teal or any cool-tone light anywhere — no blue underglow, no cyan haze, no blue rim light, no blue accents under the stand. The only light source visible should be the warm interior glow coming through the windows. (4) The reflection on the dark glossy surface below should pick up only the warm cabin glow, no blue tones. Photorealistic premium product photography, sharp details preserved, no AI artifacts, no text overlay, no badge, no logo added. Output a square 1:1 image.'

# Build JSON payload (escape the prompt + base64 of source image)
IMG_B64=$(base64 < "$SRC" | tr -d '\n')
cat > /tmp/gen-body.json <<EOF
{
  "contents": [{
    "role": "user",
    "parts": [
      {"text": $(printf '%s' "$PROMPT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')},
      {"inline_data": {"mime_type": "image/jpeg", "data": "$IMG_B64"}}
    ]
  }]
}
EOF
echo "Body size: $(wc -c < /tmp/gen-body.json) bytes"

for MODEL in gemini-3-pro-image-preview; do
  echo "→ $MODEL"
  RESP_FILE="resp-${MODEL}-v2.json"
  STATUS=$(/usr/bin/curl -s -w '%{http_code}' -o "$RESP_FILE" \
    -H 'Content-Type: application/json' \
    -X POST \
    --data-binary @/tmp/gen-body.json \
    "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}")
  echo "  HTTP $STATUS — $(wc -c < "$RESP_FILE") bytes"
  if [ "$STATUS" = "200" ]; then
    OUT="a220-led-on-${MODEL}-v2.png"
    python3 -c "
import json, base64, sys
d = json.load(open('$RESP_FILE'))
for c in d.get('candidates', []):
    for p in c.get('content', {}).get('parts', []):
        d2 = p.get('inlineData') or p.get('inline_data')
        if d2:
            open('$OUT','wb').write(base64.b64decode(d2['data']))
            print('  ✓ saved $OUT')
            sys.exit(0)
print('  ✗ no image in response. text parts:')
for c in d.get('candidates', []):
    for p in c.get('content', {}).get('parts', []):
        if 'text' in p: print('    text:', p['text'][:200])
print('  finishReason:', d.get('candidates', [{}])[0].get('finishReason'))
"
  else
    head -c 800 "$RESP_FILE"; echo
  fi
done
