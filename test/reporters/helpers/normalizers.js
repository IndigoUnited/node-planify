'use strict';

const forIn = require('lodash/forIn');
const symbols = require('../../../reporters/util/symbols');

const symbolsReplacers = [];

forIn(symbols, (symbol, name) => {
    const swappedSymbol = symbols['_' + name];

    if (swappedSymbol) {
        symbolsReplacers.push({
            regExp: new RegExp(symbol, 'g'),
            replacement: swappedSymbol,
        });
    }
});

function normalizeSymbols(str) {
    symbolsReplacers.forEach((replacer) => {
        str = str.replace(replacer.regExp, replacer.replacement);
    });

    return str;
}

function normalizeDuration(str) {
    return str.replace(/\d+ms/g, '100ms');
}

function normalizeErrorStack(str) {
    return str.replace(/Stack:[\s\S]+(\n\n)?$/g, 'Stack:$1');
}

module.exports = {
    symbols: normalizeSymbols,
    duration: normalizeDuration,
    errorStack: normalizeErrorStack,
};
