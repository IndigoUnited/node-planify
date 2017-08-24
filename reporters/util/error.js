'use strict';

const PrettyError = require('pretty-error');
const chalk = require('chalk');

// Configure prettyError instance
const prettyError = new PrettyError();

prettyError.appendStyle({
    'pretty-error > header': {
        display: 'none',
    },
    'pretty-error > trace': {
        marginTop: 0,
    },
    'pretty-error > trace > item': {
        marginBottom: 0,
    },
});

function error(err) {
    let str = '';

    if (err.code || (err.name && err.name !== 'Error')) {
        str += chalk.dim(err.code || err.name) + ' ';
    }

    str += err.message + '\n';

    if (typeof err.detail === 'string') {
        str += '\n';
        str += err.detail + '\n';
    }

    const hideStack = err.hideStack != null ? err.hideStack : !!err.detail;

    if (!hideStack) {
        str += '\n';
        str += 'Stack:\n';
        str += prettyError.render(err).trimRight() + '\n';
    }

    return str;
}

module.exports = error;
