'use strict';

const requireDirectory = require('require-directory');
const camelCase = require('lodash/camelCase');

module.exports = requireDirectory(module, { rename: camelCase });
