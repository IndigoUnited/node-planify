'use strict';

const requireDirectory = require('require-directory');

describe('scenarios', () => {
    requireDirectory(module, './scenarios', { recurse: false });
});
