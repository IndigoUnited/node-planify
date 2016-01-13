'use strict';

function swapSymbol(name, value) {
    symbols.name = value;

    Object.defineProperty(symbols, '_' + name, {  // This is necessary for the tests!
        value,
        enumerable: false,
    });
}

const symbols = {
    ok: '✓',
    fail: '✖',
    run: '-',
    hr: '━',
    dot: '․',
};

// With node.js on Windows: use symbols available in terminal default fonts
/* istanbul ignore if */
if (process.platform === 'win32') {
    swapSymbol('ok', '√');
    swapSymbol('fail', '×');
    swapSymbol('hr', '-');
    swapSymbol('dot', '..');
}

module.exports = symbols;
