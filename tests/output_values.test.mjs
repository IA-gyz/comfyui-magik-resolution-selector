import test from 'node:test';
import assert from 'node:assert/strict';
import { ASPECT_RATIO_DEFS, computeResolution } from '../web/resolution_math.mjs';

test('matches the verified examples from README / nodes.py', () => {
  assert.deepEqual(computeResolution('9:16 (Portrait Widescreen)', 0.2, 32), [320, 608]);
  assert.deepEqual(computeResolution('16:9 (Widescreen)', 0.2, 32), [608, 320]);
  assert.deepEqual(computeResolution('1:1 (Square)', 0.2, 32), [448, 448]);
  assert.deepEqual(computeResolution('9:16 (Portrait Widescreen)', 0.2, 8), [336, 600]);
  assert.deepEqual(computeResolution('3:2 (Landscape Photo)', 1.0, 32), [1216, 832]);
  assert.deepEqual(computeResolution('2.35:1 (Anamorphic Widescreen)', 1.0, 64), [1536, 640]);
});

test('banker rounding parity with python round (half to even)', () => {
  // 1:1 at 0.01 MP -> ideal 100x100; 100/8 = 12.5 -> python round -> 12 -> 96
  assert.deepEqual(computeResolution('1:1 (Square)', 0.01, 8), [96, 96]);
});

test('every preset snaps to an exact multiple and never below one multiple', () => {
  for (const [label] of ASPECT_RATIO_DEFS) {
    for (const [mp, m] of [[0.2, 32], [1.0, 64], [0.01, 8], [16.0, 1]]) {
      const [w, h] = computeResolution(label, mp, m);
      assert.equal(w % m, 0, `${label} w=${w} m=${m}`);
      assert.equal(h % m, 0, `${label} h=${h} m=${m}`);
      assert.ok(w >= m && h >= m);
    }
  }
});

test('unknown preset throws', () => {
  assert.throws(() => computeResolution('nope', 1, 32), /Unknown aspect-ratio preset/);
});
