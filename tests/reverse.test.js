const { test } = require('node:test');
const assert = require('node:assert');

const { reverse } = require('../utils/forTesting');

test('reverse of a', () => {
  const result = reverse('a');

  assert.strictEqual(result, 'a');
});

test('reverse of node', () => {
  const result = reverse('node');
  assert.strictEqual(result, 'edon');
});

test('reverse of difficult', () => {
  const result = reverse('difficult');

  assert.strictEqual(result, 'tluciffid');
});
