'use strict';

const forIn = require('lodash/forIn');
const cliProgressBarThemes = require('cli-progress-bar/themes');
const cliCharacterSet = require('cli-character-set')();
const expected = require('./helpers/expected');
const normalizers = require('./helpers/normalizers');

const symbolsReplacers = [];

if (cliCharacterSet !== 'unicode') {
    forIn(cliProgressBarThemes[cliCharacterSet], (symbol, name) => {
        const swappedSymbol = cliProgressBarThemes.unicode[name];

        symbolsReplacers.push({
            regExp: new RegExp(symbol, 'g'),
            replacement: swappedSymbol,
        });
    });
}

function normalize(str) {
    str = normalizers.duration(str);

    // Normalize progress bar symbols
    symbolsReplacers.forEach((replacer) => {
        str = str.replace(replacer.regExp, replacer.replacement);
    });

    return str;
}

const expectations = expected.expectations('progress');

describe('progress', () => {
    let originalColumns;

    before(() => {
        originalColumns = process.stdout.columns;
        process.stdout.columns = 80;
    });

    after(() => {
        process.stdout.columns = originalColumns;
    });

    expected.test(expectations, normalize);
});
