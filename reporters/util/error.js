'use strict';

const PrettyError = require('pretty-error');
const chalk = require('chalk');

// Configure prettyError instance
const prettyError = new PrettyError();

prettyError.appendStyle({
    'pretty-error > header': {
        display: 'none',
    },
    'pretty-error > trace > item': {
        marginBottom: 0,
    },
});

function error(err) {
    let str = '';

    if (err.code || err.name !== 'Error') {
        str += chalk.dim(err.code || err.name) + ' ';
    }

    str += err.message + '\n';

    if (typeof err.detail === 'string') {
        str += '\n';
        str += err.detail + '\n';
    } else if (!err.hideStack) {
        str += '\n';
        str += 'Stack:';
        str += prettyError.render(err);
    }

    return str;
}

module.exports = error;
