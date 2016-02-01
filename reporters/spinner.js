'use strict';

const chalk = require('chalk');
const ansiEscapes = require('ansi-escapes');

const sequence = ['|', '/', '-', '\\'];

function printSequence(index, isError) {
    index = (index < sequence.length - 1) ? index + 1 : 0;

    const str = isError ? chalk.bold.yellow(sequence[index]) : chalk.bold.green(sequence[index]);

    process.stdout.write(ansiEscapes.eraseLine + ansiEscapes.cursorLeft);
    process.stdout.write(str);

    return index;
}

function reporter() {
    let index;

    return {
        plan: {
            start() {
                index = 0;

                const str = chalk.bold.green(sequence[index]);

                process.stdout.write(ansiEscapes.cursorHide);
                process.stdout.write(str);
            },
            fail(plan, err) {
                let str = chalk.bold.red('ERROR:') + '\n';

                str += err.message + '\n';

                if (typeof err.detail === 'string') {
                    str += '\n';
                    str += err.detail + '\n';
                }

                process.stdout.write(ansiEscapes.eraseLine + ansiEscapes.cursorLeft);
                process.stdout.write(str);
            },

            ok() {
                const str = chalk.bold.green('Done!\n');

                process.stdout.write(ansiEscapes.eraseLine + ansiEscapes.cursorLeft);
                process.stdout.write(str);
            },
            finish() {
                process.stdout.write(ansiEscapes.cursorShow);
            },
        },

        step: {
            ok() {
                index = printSequence(index);
            },
            fail() {
                index = printSequence(index, true);
            },
        },
    };
}

module.exports = reporter;
