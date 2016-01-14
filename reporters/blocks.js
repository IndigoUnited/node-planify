'use strict';

const chalk = require('chalk');
const assign = require('lodash/assign');
const indentString = require('indent-string');
const ansiEscapes = require('ansi-escapes');
const duration = require('./util/duration');
const symbols = require('./util/symbols');

function label(label, indent, color) {
    let str;

    str = '\n';
    str += chalk.inverse[color](' ' + label + ' ') + '\n';
    str += chalk[color](symbols.hr.repeat(80 - indent * 2)) + '\n';

    return indentString(str, '  ', indent);
}

function reporter(options) {
    options = assign({
        stdout: process.stdout,
    }, options);

    let stdout;  // Need to grab references to the write methods because of step.write.* methods

    return {
        plan: {
            start() {
                stdout = options.stdout.write.bind(options.stdout);
                stdout(ansiEscapes.cursorHide);
            },
            ok(plan) {
                let str;

                str = '\n';
                str += 'Completed ' + plan.steps.length + ' step' + (plan.steps.length === 1 ? '' : 's') + ' in ';
                str += duration(plan) + '\n';

                stdout(str);
            },
            finish() {
                stdout(ansiEscapes.cursorShow);
            },
        },

        phase: {
            start(phase) {
                stdout(label(phase.label, phase.depth, 'cyan'));
            },
        },

        step: {
            start(step) {
                stdout(label(step.label, step.depth, 'white'));
            },
            write: {
                stdout(step, str) {
                    stdout(indentString('' + str, '  ', step.depth));  // str can be a buffer
                },
                stderr(step, str) {
                    stdout(indentString('' + str, '  ', step.depth));  // str can be a buffer
                },
            },
            fail(step, err) {
                stdout(label('ERROR', step.depth, 'red'));

                let str = (err.code ? err.code + ' - ' : '') + err.message + '\n';

                if (typeof err.detail === 'string') {
                    str += '\n';
                    str += err.detail + '\n';
                }

                stdout(indentString(str, '  ', step.depth));
            },
        },
    };
}

module.exports = reporter;
