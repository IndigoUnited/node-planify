'use strict';

const readline = require('readline');
const indentString = require('indent-string');
const stripAnsi = require('strip-ansi');
const endsWith = require('lodash/endsWith');
const wrap = require('lodash/wrap');

let prompting = false;

// Monkey patch readline so that indentation is disabled while prompting
// This is necessary, otherwise output would be totally messed up
readline.createInterface = wrap(readline.createInterface, (originalCreateInterface, config) => {
    const instance = originalCreateInterface(config);

    prompting = true;

    instance.close = wrap(instance.close, (originalClose) => {
        prompting = false;
        return originalClose.call(instance);
    });

    return instance;
});

function indenter() {
    let isLineEmpty = true;

    return function (message, depth) {
        // Do not indent if prompting
        if (prompting) {
            return message;
        }

        const strippedMessage = stripAnsi(message);

        // Do not indent if message has only ansicodes in it
        if (message && !strippedMessage) {
            return message;
        }

        message = indentString(message, depth, '  ');

        // If we are not in a new line, we must strip the leading indentation while
        // keeping the indentation made for subsequent lines
        if (!isLineEmpty) {
            message = message.replace(new RegExp('^( ){' + (depth * 2) + '}'), '');
        }

        isLineEmpty = endsWith(strippedMessage, '\n');

        return message;
    };
}

module.exports = indenter;
