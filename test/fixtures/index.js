'use strict';

const requireDirectory = require('require-directory');
const camelCase = require('lodash/string/camelCase');

module.exports = requireDirectory(module, { rename: camelCase });
