// Directory may be used later for future tests
// Generated test by codex just to know how it looks

const { test } = require('node:test');
const assert = require('node:assert/strict');

function fitsOnRow(column, length) {
  return column >= 0 && column + length <= 10;
}

test('Корабль помещается у края поля, но не выходит за него', () => {
  assert.equal(fitsOnRow(7, 3), true);
  assert.equal(fitsOnRow(8, 3), false);
});
