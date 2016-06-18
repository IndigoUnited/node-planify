'use strict';

const chalk = require('chalk');
const assign = require('lodash/assign');
const ansiEscapes = require('ansi-escapes');
const duration = require('./util/duration');
const symbols = require('./util/symbols');
const indenter = require('./util/indenter');

function reporter(options) {
    options = assign({
        stdout: process.stdout,
    }, options);

    const indent = indenter();

    return {
        plan: {
            start() {
                options.stdout.write(ansiEscapes.cursorHide);
                options.stdout.write('\n');
            },
            ok(plan) {
                let str;

                str = '\n';
                str += plan.steps.length + ' step' + (plan.steps.length === 1 ? '' : 's') + ' ok';
                str += ' ' + duration(plan, '(%s)') + '\n';

                options.stdout.write(indent(str, 1));
            },
            fail(plan, err) {
                let str;

                str = '\n';
                str += chalk.bold.red('ERROR:') + '\n';
                str += err.message + '\n';

                if (typeof err.detail === 'string') {
                    str += '\n';
                    str += err.detail + '\n';
                }

                options.stdout.write(str);
            },
            finish() {
                options.stdout.write('\n');
                options.stdout.write(ansiEscapes.cursorShow);
            },
        },

        phase: {
            start(phase) {
                options.stdout.write(indent(phase.label + '\n', phase.depth + 1));
            },
        },

        step: {
            start(step) {
                const str = chalk.cyan(symbols.run) + '  ' + chalk.gray(step.label) + '\n';

                options.stdout.write(indent(str, step.depth + 1));
            },
            ok(step) {
                let str;

                str = chalk.green(symbols.ok) + '  ' + chalk.gray(step.label);
                str += (step.info.speed !== 'fast' ? duration(step, ' (%s)') : '') + '\n';

                options.stdout.write(ansiEscapes.cursorUp() + ansiEscapes.eraseLine + ansiEscapes.cursorLeft);
                options.stdout.write(indent(str, step.depth + 1));
            },
            fail(step) {
                const str = chalk.red(symbols.fail) + '  ' + chalk.gray(step.label) + '\n';

                options.stdout.write(ansiEscapes.cursorUp() + ansiEscapes.eraseLine + ansiEscapes.cursorLeft);
                options.stdout.write(indent(str, step.depth + 1));
            },
        },
    };
}

module.exports = reporter;
