import { app } from '../../scripts/app.js';
import { computeResolution, fitAspectRect } from './resolution_math.mjs';

const NODE_TYPES = new Set([
  'MagikResolutionSelector',
  'MagikTwoResolutionsSelector',
  'MagikThreeResolutionsSelector',
]);

const VALUE_WIDGETS = new Set([
  'asp',
  'megapixels', 'multiple',
  'megapixels_1', 'multiple_1',
  'megapixels_2', 'multiple_2',
  'megapixels_3', 'multiple_3',
]);

const PREVIEW_HEIGHT = 64;
const PREVIEW_PAD = 6;
const CAPTION_HEIGHT = 12;

function readResolutions(node) {
  const values = {};
  for (const w of node.widgets ?? []) values[w.name] = w.value;
  if (values.asp === undefined) return null;

  const count = Math.floor((node.outputs ?? []).length / 2);
  if (!count) return null;

  const resolutions = [];
  for (let i = 1; i <= count; i++) {
    const suffix = count === 1 ? '' : `_${i}`;
    const mp = values[`megapixels${suffix}`];
    const m = values[`multiple${suffix}`];
    if (mp === undefined || m === undefined) return null;
    try {
      resolutions.push(computeResolution(values.asp, mp, m));
    } catch {
      return null;
    }
  }
  return resolutions;
}

function ensurePreviewSpace(node) {
  const min = node.computeSize();
  const needed = min[1] + PREVIEW_HEIGHT;
  if (node.size[0] < min[0] || node.size[1] < needed) {
    node.setSize([Math.max(node.size[0], min[0]), Math.max(node.size[1], needed)]);
  }
}

function refresh(node) {
  ensurePreviewSpace(node);
  node.graph?.setDirtyCanvas?.(true, true);
}

function drawAspectPreview(node, ctx) {
  if (node.flags?.collapsed) return;
  if (node.size[1] < PREVIEW_HEIGHT + 24) return;
  const resolutions = readResolutions(node);
  if (!resolutions) return;

  const areaH = PREVIEW_HEIGHT - 2 * PREVIEW_PAD - CAPTION_HEIGHT;
  const x0 = PREVIEW_PAD;
  const y0 = node.size[1] - PREVIEW_HEIGHT + PREVIEW_PAD;
  const slotW = (node.size[0] - 2 * PREVIEW_PAD) / resolutions.length;
  const maxPixels = Math.max(...resolutions.map(([w, h]) => w * h));

  ctx.save();
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 1;

  resolutions.forEach(([w, h], i) => {
    const scale = Math.sqrt((w * h) / maxPixels);
    const [fitW] = fitAspectRect(w, h, slotW - 6, areaH);
    const rw = Math.max(4, fitW * scale);
    const rh = rw / (w / h);
    const cx = x0 + slotW * (i + 0.5);
    const cy = y0 + areaH / 2;
    const rx = cx - rw / 2;
    const ry = cy - rh / 2;

    ctx.fillStyle = 'rgba(128, 128, 128, 0.30)';
    ctx.strokeStyle = 'rgba(170, 170, 170, 0.90)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(rx, ry, rw, rh, 3);
    else ctx.rect(rx, ry, rw, rh);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(170, 170, 170, 0.90)';
    ctx.fillText(`${w}×${h}`, cx, y0 + areaH + CAPTION_HEIGHT / 2);
  });

  ctx.restore();
}

app.registerExtension({
  name: 'magik.resolution.selector.aspectPreview',
  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (!NODE_TYPES.has(nodeData.name)) return;
    const proto = nodeType.prototype;

    const origCreated = proto.onNodeCreated;
    proto.onNodeCreated = function () {
      const node = this;
      const r = origCreated?.apply(this, arguments);
      for (const w of node.widgets ?? []) {
        if (!VALUE_WIDGETS.has(w.name)) continue;
        const origCallback = w.callback;
        w.callback = function (...args) {
          const res = origCallback?.apply(this, args);
          refresh(node);
          return res;
        };
      }
      refresh(node);
      return r;
    };

    const origConfigure = proto.onConfigure;
    proto.onConfigure = function (...args) {
      const r = origConfigure?.apply(this, args);
      setTimeout(() => refresh(this), 0);
      return r;
    };

    const origExecuted = proto.onExecuted;
    proto.onExecuted = function (...args) {
      const r = origExecuted?.apply(this, args);
      refresh(this);
      return r;
    };

    const origDrawBackground = proto.onDrawBackground;
    proto.onDrawBackground = function (ctx) {
      const r = origDrawBackground?.apply(this, arguments);
      drawAspectPreview(this, ctx);
      return r;
    };
  },
});
