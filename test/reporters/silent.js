'use strict';

const expected = require('./helpers/expected');

function normalize(str) {
    return str.replace(/\d+ms/g, '100ms');
}

const expectations = expected.expectations('silent');

describe('silent', () => {
    expected.test(expectations, normalize);
});
