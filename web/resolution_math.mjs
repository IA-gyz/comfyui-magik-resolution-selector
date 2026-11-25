// Pure mirror of the resolution math in nodes.py — keep both in sync.
// Python's round() is banker's rounding (half to even), so pyRound()
// reproduces it exactly (JS Math.round is half up).

export const ASPECT_RATIO_DEFS = [
  ['2.35:1 (Anamorphic Widescreen)', 2.35, 1.0],
  ['21:9 (Cinematic Widescreen)', 21.0, 9.0],
  ['2:1 (Panorama)', 2.0, 1.0],
  ['1.85:1 (Cinematic Flat)', 1.85, 1.0],
  ['16:9 (Widescreen)', 16.0, 9.0],
  ['16:10 (Landscape Widescreen)', 16.0, 10.0],
  ['3:2 (Landscape Photo)', 3.0, 2.0],
  ['5:4 (Landscape Large Format)', 5.0, 4.0],
  ['4:3 (Landscape Classic)', 4.0, 3.0],
  ['1:1 (Square)', 1.0, 1.0],
  ['4:5 (Portrait Large Format)', 4.0, 5.0],
  ['3:4 (Portrait Classic)', 3.0, 4.0],
  ['2:3 (Portrait Photo)', 2.0, 3.0],
  ['1:2 (Portrait Panorama)', 1.0, 2.0],
  ['9:16 (Portrait Widescreen)', 9.0, 16.0],
];

export const ASPECT_RATIO_MAP = Object.fromEntries(
  ASPECT_RATIO_DEFS.map(([label, w, h]) => [label, [w, h]])
);

function pyRound(x) {
  const floor = Math.floor(x);
  const diff = x - floor;
  if (diff > 0.5) return floor + 1;
  if (diff < 0.5) return floor;
  return floor % 2 === 0 ? floor : floor + 1;
}

export function computeResolution(asp, megapixels, multiple) {
  const pair = ASPECT_RATIO_MAP[asp];
  if (!pair) throw new Error(`Unknown aspect-ratio preset: ${asp}`);
  const [ratioW, ratioH] = pair;
  const ratio = ratioW / ratioH;
  const targetPixels = Math.max(0, Number(megapixels)) * 1_000_000;
  const heightIdeal = Math.sqrt(targetPixels / ratio);
  const widthIdeal = heightIdeal * ratio;
  const m = Math.max(1, Math.trunc(Number(multiple)));
  const width = Math.max(m, pyRound(widthIdeal / m) * m);
  const height = Math.max(m, pyRound(heightIdeal / m) * m);
  return [width, height];
}

export function fitAspectRect(w, h, boxW, boxH) {
  const ratio = w / h;
  let rw = boxW;
  let rh = rw / ratio;
  if (rh > boxH) {
    rh = boxH;
    rw = rh * ratio;
  }
  return [rw, rh];
}
