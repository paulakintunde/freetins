import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

test('click-counter example adds, resets, and starts from zero', () => {
  const html = readFileSync('public/examples/click-counter/index.html', 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'example has no inline script');

  const elements = new Map([
    ['#count', { textContent: '0' }],
    ['#add', { listeners: new Map(), addEventListener(name, handler) { this.listeners.set(name, handler); } }],
    ['#reset', { listeners: new Map(), addEventListener(name, handler) { this.listeners.set(name, handler); } }],
  ]);
  const document = { querySelector: (selector) => elements.get(selector) ?? null };

  vm.runInNewContext(script, { document });
  assert.equal(elements.get('#count').textContent, '0');

  const add = elements.get('#add').listeners.get('click');
  const reset = elements.get('#reset').listeners.get('click');
  assert.equal(typeof add, 'function');
  assert.equal(typeof reset, 'function');

  add();
  add();
  add();
  assert.equal(elements.get('#count').textContent, '3');

  reset();
  assert.equal(elements.get('#count').textContent, '0');
});
