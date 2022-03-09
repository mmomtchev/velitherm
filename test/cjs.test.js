const velitherm = require('..');

const { assert } = require('chai');

describe('CJS module', () => {
  it('require()', () => {
    assert.isString(velitherm, velitherm.velitherm);
  });
});
