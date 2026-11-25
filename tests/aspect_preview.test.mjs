import test from 'node:test';
import assert from 'node:assert/strict';
import { fitAspectRect } from '../web/resolution_math.mjs';

test('landscape ratio fills the box by width', () => {
  const [w, h] = fitAspectRect(16, 9, 100, 100);
  assert.ok(Math.abs(w - 100) < 1e-9);
  assert.ok(Math.abs(h - 56.25) < 1e-9);
});

test('portrait ratio fills the box by height', () => {
  const [w, h] = fitAspectRect(9, 16, 100, 100);
  assert.ok(Math.abs(h - 100) < 1e-9);
  assert.ok(Math.abs(w - 56.25) < 1e-9);
});

test('never exceeds the box and keeps the aspect ratio', () => {
  for (const [rw, rh] of [[2.35, 1], [1, 2.35], [1, 1], [16, 9], [9, 16], [21, 9]]) {
    for (const [bw, bh] of [[62, 40], [40, 62], [10, 10], [300, 20], [20, 300]]) {
      const [w, h] = fitAspectRect(rw, rh, bw, bh);
      assert.ok(w <= bw + 1e-9 && h <= bh + 1e-9, `${rw}:${rh} in ${bw}x${bh} -> ${w}x${h}`);
      assert.ok(Math.abs(w / h - rw / rh) < 1e-9);
      assert.ok(w > 0 && h > 0);
    }
  }
});
