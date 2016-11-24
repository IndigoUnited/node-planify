'use strict';

const requireDirectory = require('require-directory');

describe('reporters', () => {
    requireDirectory(module, './reporters', { recurse: false });
});
