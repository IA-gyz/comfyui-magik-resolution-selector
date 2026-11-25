# Magik Resolution Selector

A ComfyUI custom node pack with three resolution-picker nodes. All derive clean,
model-friendly width/height values from an aspect-ratio preset, a megapixel target
and a snapping multiple, ready to feed into empty-latent, conditioning, upscale or
sampler nodes.

- **Magik Resolution Selector** — one resolution pair (`width`, `height`)
- **Magik Two Resolutions Selector** — two independently configured resolution pairs
  (`width_1`, `height_1`, `width_2`, `height_2`) sharing the same aspect ratio
- **Magik Three Resolutions Selector** — three independently configured resolution
  pairs (`width_1`, `height_1`, `width_2`, `height_2`, `width_3`, `height_3`) sharing
  the same aspect ratio

![node](https://img.shields.io/badge/ComfyUI-custom_node-blue)

## Live output values

Every output dot shows its current value next to its name (e.g. `width: 320`,
`height_1: 608`). The labels update live whenever an `asp`, `megapixels` or
`multiple` widget changes, when a workflow is loaded, and again at execution time.
This is done by a small frontend extension in `web/` (loaded automatically via
`WEB_DIRECTORY`); the resolution math is mirrored in `web/resolution_math.mjs`.

## Aspect-ratio preview

Each node also draws a small preview strip at its bottom: one rectangle per
resolution, shaped exactly like the selected `asp` preset and captioned with its
snapped `W×H` (e.g. `320×608`). In the two- and three-resolution nodes the
rectangles are scaled relative to each other by their megapixel targets, so a
quick glance shows both the framing and which stage is the largest. The preview
updates live on every widget change, on workflow load and at execution time.
Implemented in `web/resolution_aspect_preview.js`.

## Magik Resolution Selector

### Widgets

| Widget       | Type  | Default | Description |
| ------------ | ----- | ------- | ----------- |
| `asp`        | Combo | `9:16 (Portrait Widescreen)` | Aspect-ratio preset (width:height) that shapes the resolution. 15 presets, see below. |
| `megapixels` | FLOAT | `0.2`   | Target total pixel count (width x height), in megapixels. Range 0.01–16. |
| `multiple`   | INT   | `32`    | Width and height are snapped to the nearest multiple of this value (1–512). Use 8, 16, 32 or 64 for model-friendly grids. |

### Outputs

| Output  | Type | Description |
| ------- | ---- | ----------- |
| `width`  | INT | Snapped image width in pixels |
| `height` | INT | Snapped image height in pixels |

## Magik Two Resolutions Selector

A merge of two Magik Resolution Selectors locked to the same aspect-ratio preset.
Each resolution is configured independently, so one node can drive two stages of a
workflow (e.g. a low-res draft latent and a high-res refiner latent) with identical
framing.

### Widgets

| Widget         | Type  | Default | Description |
| -------------- | ----- | ------- | ----------- |
| `asp`          | Combo | `9:16 (Portrait Widescreen)` | Aspect-ratio preset shared by BOTH resolutions. 15 presets, see below. |
| `megapixels_1` | FLOAT | `0.2`   | Resolution 1: target pixel count (width_1 x height_1) in megapixels. Range 0.01–16. |
| `multiple_1`   | INT   | `32`    | Resolution 1: width_1 / height_1 snap to the nearest multiple of this value. |
| `megapixels_2` | FLOAT | `0.2`   | Resolution 2: target pixel count (width_2 x height_2) in megapixels. Range 0.01–16. |
| `multiple_2`   | INT   | `32`    | Resolution 2: width_2 / height_2 snap to the nearest multiple of this value. |

### Outputs

| Output     | Type | Description |
| ---------- | ---- | ----------- |
| `width_1`  | INT | Resolution 1: snapped image width in pixels |
| `height_1` | INT | Resolution 1: snapped image height in pixels |
| `width_2`  | INT | Resolution 2: snapped image width in pixels |
| `height_2` | INT | Resolution 2: snapped image height in pixels |

### Verified examples

| `asp` | Resolution 1 | Resolution 2 | Result | Actual MP |
| ----- | ------------ | ------------ | ------ | --------- |
| 9:16 (Portrait Widescreen) | 0.2 MP x 32 | 0.2 MP x 32 | 320 x 608 / 320 x 608 | 0.195 / 0.195 |
| 9:16 (Portrait Widescreen) | 0.2 MP x 32 | 1.0 MP x 64 | 320 x 608 / 768 x 1344 | 0.195 / 1.032 |
| 1:1 (Square) | 0.2 MP x 32 | 0.5 MP x 16 | 448 x 448 / 704 x 704 | 0.201 / 0.496 |
| 16:9 (Widescreen) | 0.5 MP x 16 | 1.0 MP x 32 | 944 x 528 / 1344 x 736 | 0.498 / 0.989 |

## Magik Three Resolutions Selector

A merge of three Magik Resolution Selectors locked to the same aspect-ratio preset.
Each resolution is configured independently, so one node can drive three stages of a
workflow (e.g. a low-res draft latent, a mid-res refiner latent and a high-res final
latent) with identical framing.

### Widgets

| Widget         | Type  | Default | Description |
| -------------- | ----- | ------- | ----------- |
| `asp`          | Combo | `9:16 (Portrait Widescreen)` | Aspect-ratio preset shared by ALL THREE resolutions. 15 presets, see below. |
| `megapixels_1` | FLOAT | `0.2`   | Resolution 1: target pixel count (width_1 x height_1) in megapixels. Range 0.01–16. |
| `multiple_1`   | INT   | `32`    | Resolution 1: width_1 / height_1 snap to the nearest multiple of this value. |
| `megapixels_2` | FLOAT | `0.2`   | Resolution 2: target pixel count (width_2 x height_2) in megapixels. Range 0.01–16. |
| `multiple_2`   | INT   | `32`    | Resolution 2: width_2 / height_2 snap to the nearest multiple of this value. |
| `megapixels_3` | FLOAT | `0.2`   | Resolution 3: target pixel count (width_3 x height_3) in megapixels. Range 0.01–16. |
| `multiple_3`   | INT   | `32`    | Resolution 3: width_3 / height_3 snap to the nearest multiple of this value. |

### Outputs

| Output     | Type | Description |
| ---------- | ---- | ----------- |
| `width_1`  | INT | Resolution 1: snapped image width in pixels |
| `height_1` | INT | Resolution 1: snapped image height in pixels |
| `width_2`  | INT | Resolution 2: snapped image width in pixels |
| `height_2` | INT | Resolution 2: snapped image height in pixels |
| `width_3`  | INT | Resolution 3: snapped image width in pixels |
| `height_3` | INT | Resolution 3: snapped image height in pixels |

### Verified examples

| `asp` | Resolution 1 | Resolution 2 | Resolution 3 | Result | Actual MP |
| ----- | ------------ | ------------ | ------------ | ------ | --------- |
| 9:16 (Portrait Widescreen) | 0.2 MP x 32 | 0.5 MP x 32 | 1.0 MP x 64 | 320 x 608 / 544 x 928 / 768 x 1344 | 0.195 / 0.505 / 1.032 |
| 16:9 (Widescreen) | 0.2 MP x 32 | 0.5 MP x 16 | 1.0 MP x 32 | 608 x 320 / 944 x 528 / 1344 x 736 | 0.195 / 0.498 / 0.989 |
| 1:1 (Square) | 0.2 MP x 32 | 0.5 MP x 16 | 1.0 MP x 64 | 448 x 448 / 704 x 704 / 1024 x 1024 | 0.201 / 0.496 / 1.049 |

## Aspect-ratio presets (shared by all nodes)

Landscape: `2.35:1 (Anamorphic Widescreen)`, `21:9 (Cinematic Widescreen)`,
`2:1 (Panorama)`, `1.85:1 (Cinematic Flat)`, `16:9 (Widescreen)`,
`16:10 (Landscape Widescreen)`, `3:2 (Landscape Photo)`,
`5:4 (Landscape Large Format)`, `4:3 (Landscape Classic)` · Square: `1:1 (Square)` ·
Portrait: `4:5 (Portrait Large Format)`, `3:4 (Portrait Classic)`,
`2:3 (Portrait Photo)`, `1:2 (Portrait Panorama)`, `9:16 (Portrait Widescreen)`

## How the math works

```
ratio         = asp_width / asp_height
target_pixels = megapixels * 1,000,000
height_ideal  = sqrt(target_pixels / ratio)
width_ideal   = height_ideal * ratio
width, height = round(ideal / multiple) * multiple     # never below one multiple
```

Both dimensions are rounded to the **nearest** multiple, so the final pixel count can
differ slightly from the megapixel target — that is the price of a clean grid.

### Verified examples

| `asp` | `megapixels` | `multiple` | Result | Actual MP |
| ----- | ------------ | ---------- | ------ | --------- |
| 9:16 (Portrait Widescreen) | 0.2 | 32 | 320 x 608 | 0.195 |
| 16:9 (Widescreen) | 0.2 | 32 | 608 x 320 | 0.195 |
| 1:1 (Square) | 0.2 | 32 | 448 x 448 | 0.201 |
| 9:16 (Portrait Widescreen) | 0.2 | 8 | 336 x 600 | 0.202 |
| 3:2 (Landscape Photo) | 1.0 | 32 | 1216 x 832 | 1.012 |
| 2.35:1 (Anamorphic Widescreen) | 1.0 | 64 | 1536 x 640 | 0.983 |

All 15 presets at the defaults (0.2 MP, multiple 32):

```
asp                                 width  height  actual MP
--------------------------------------------------------------
2.35:1 (Anamorphic Widescreen)        672     288      0.194
21:9 (Cinematic Widescreen)           672     288      0.194
2:1 (Panorama)                        640     320      0.205
1.85:1 (Cinematic Flat)               608     320      0.195
16:9 (Widescreen)                     608     320      0.195
16:10 (Landscape Widescreen)          576     352      0.203
3:2 (Landscape Photo)                 544     352      0.191
5:4 (Landscape Large Format)          512     384      0.197
4:3 (Landscape Classic)               512     384      0.197
1:1 (Square)                          448     448      0.201
4:5 (Portrait Large Format)           384     512      0.197
3:4 (Portrait Classic)                384     512      0.197
2:3 (Portrait Photo)                  352     544      0.191
1:2 (Portrait Panorama)               320     640      0.205
9:16 (Portrait Widescreen)            320     608      0.195
```

## Installation

**Option A — zip:** copy `magik-resolution-selector.zip` into `ComfyUI/custom_nodes/`
and extract it (or drag it onto ComfyUI Manager's "Install from file"), then restart.

**Option B — folder:** copy the `magik-resolution-selector` folder itself into
`ComfyUI/custom_nodes/`, then restart ComfyUI.

The three nodes appear under **Add Node → Magik → Magik Resolution Selector**,
**Add Node → Magik → Magik Two Resolutions Selector** and
**Add Node → Magik → Magik Three Resolutions Selector**.
No third-party dependencies are required. The `web/` extension that renders the
live output-value labels loads automatically — no extra setup.

## Development

The JS mirror of the resolution math is parity-tested against the README examples:

```
node --test
```

## Usage tips

- Typical widget chain: `Magik Resolution Selector` → `EmptyLatentImage` (or any node
  taking width/height INTs).
- `Magik Two Resolutions Selector` chain: (`width_1`, `height_1`) → first-stage
  `EmptyLatentImage`, (`width_2`, `height_2`) → second-stage latent / upscale — same
  framing at two resolutions from one node.
- `Magik Three Resolutions Selector` chain: (`width_1`, `height_1`) → draft latent,
  (`width_2`, `height_2`) → refiner latent, (`width_3`, `height_3`) → final latent /
  upscale — same framing at three resolutions from one node.
- `multiple = 64` keeps Flux/SDXL-class models happy on large grids;
  `multiple = 8` gives the finest aspect-ratio fidelity.
- At small megapixel values extreme presets (2.35:1, 21:9, 9:16) land on the same
  snapped size as their neighbour — that is expected: at 0.2 MP there simply isn't
  enough resolution to distinguish 21:9 from 2.35:1 on a 32-px grid.
