'use strict';

const chalk = require('chalk');
const ansiEscapes = require('ansi-escapes');
const error = require('./util/error');

const sequence = ['|', '/', '-', '\\'];

function printSequence(index, stdout) {
    index = (index < sequence.length - 1) ? index + 1 : 0;

    const str = chalk.bold(sequence[index]);

    stdout.write(ansiEscapes.eraseLine + ansiEscapes.cursorLeft);
    stdout.write(str);

    return index;
}

function reporter(options) {
    options = Object.assign({
        stdout: process.stdout,
    }, options);

    let index;

    return {
        plan: {
            start() {
                index = 0;

                options.stdout.write(ansiEscapes.cursorHide);
                index = printSequence(index, options.stdout);
            },
            fail(plan, err) {
                options.stdout.write(ansiEscapes.eraseLine + ansiEscapes.cursorLeft);

                let str;

                str = chalk.bold.red('ERROR:') + '\n';
                str += error(err);

                options.stdout.write(str);
            },

            ok() {
                options.stdout.write(ansiEscapes.eraseLine + ansiEscapes.cursorLeft);
                options.stdout.write(chalk.bold.green('Done!\n'));
            },
            finish() {
                options.stdout.write(ansiEscapes.cursorShow);
            },
        },

        step: {
            ok() {
                index = printSequence(index, options.stdout);
            },
            fail() {
                index = printSequence(index, options.stdout);
            },
        },
    };
}

module.exports = reporter;
