'use strict';

const chalk = require('chalk');
const assign = require('lodash/assign');
const ansiEscapes = require('ansi-escapes');
const duration = require('./util/duration');
const symbols = require('./util/symbols');
const indenter = require('./util/indenter');

function label(label, color, depth) {
    let str;

    str = '\n';
    str += chalk.inverse[color](' ' + label + ' ') + '\n';
    str += chalk[color](symbols.hr.repeat(80 - depth * 2)) + '\n';

    return str;
}

function reporter(options) {
    options = assign({
        stdout: process.stdout,
    }, options);

    let stdout;  // Need to grab references to the write methods because of step.write.* methods
    const indent = indenter();

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
                stdout(indent(label(phase.label, 'cyan', phase.depth), phase.depth));
            },
        },

        step: {
            start(step) {
                stdout(indent(label(step.label, 'white', step.depth), step.depth));
            },
            write: {
                stdout(step, str) {
                    stdout(indent('' + str, step.depth));  // str can be a buffer
                },
                stderr(step, str) {
                    stdout(indent('' + str, step.depth));  // str can be a buffer
                },
            },
            fail(step, err) {
                stdout(indent(label('ERROR', 'red', step.depth), step.depth));

                let str = (err.code ? err.code + ' - ' : '') + err.message + '\n';

                if (typeof err.detail === 'string') {
                    str += '\n';
                    str += err.detail + '\n';
                }

                stdout(indent(str, step.depth));
            },
        },
    };
}

module.exports = reporter;
