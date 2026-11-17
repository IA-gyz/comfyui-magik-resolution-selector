import { app } from '../../scripts/app.js';
import { computeResolution } from './resolution_math.mjs';

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

function refreshLabels(node) {
  const values = {};
  for (const w of node.widgets ?? []) values[w.name] = w.value;
  if (values.asp === undefined) return;

  const outputs = node.outputs ?? [];
  const count = Math.floor(outputs.length / 2);
  if (!count) return;

  const labels = [];
  for (let i = 1; i <= count; i++) {
    const suffix = count === 1 ? '' : `_${i}`;
    const mp = values[`megapixels${suffix}`];
    const m = values[`multiple${suffix}`];
    if (mp === undefined || m === undefined) return;
    let w, h;
    try {
      [w, h] = computeResolution(values.asp, mp, m);
    } catch {
      return;
    }
    labels.push(w, h);
  }

  outputs.forEach((out, i) => {
    if (out && labels[i] !== undefined) out.label = `${out.name}: ${labels[i]}`;
  });

  const min = node.computeSize();
  if (node.size[0] < min[0] || node.size[1] < min[1]) {
    node.setSize([Math.max(node.size[0], min[0]), Math.max(node.size[1], min[1])]);
  }
  node.graph?.setDirtyCanvas?.(true, true);
}

app.registerExtension({
  name: 'magik.resolution.selector.outputValues',
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
          refreshLabels(node);
          return res;
        };
      }
      refreshLabels(node);
      return r;
    };

    const origConfigure = proto.onConfigure;
    proto.onConfigure = function (...args) {
      const r = origConfigure?.apply(this, args);
      setTimeout(() => refreshLabels(this), 0);
      return r;
    };

    const origExecuted = proto.onExecuted;
    proto.onExecuted = function (...args) {
      const r = origExecuted?.apply(this, args);
      refreshLabels(this);
      return r;
    };
  },
});
