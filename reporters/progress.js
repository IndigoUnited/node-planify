'use strict';

const ProgressBar = require('cli-progress-bar');
const chalk = require('chalk');
const duration = require('./util/duration');

function reporter() {
    let bar;
    let completedSteps;
    let totalSteps;

    return {
        plan: {
            start(plan) {
                totalSteps = plan.steps.length;
                completedSteps = 0;

                bar = new ProgressBar();
                bar.show('', 0);
            },

            ok(plan) {
                let str;

                str = '\n';
                str += plan.steps.length + ' step' + (plan.steps.length === 1 ? '' : 's') + ' ok';
                str += ' ' + duration(plan, '(%s)') + '\n';

                process.stdout.write(str);
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

                process.stdout.write(str);
            },
        },

        step: {
            ok() {
                completedSteps += 1;
                bar.show('', completedSteps / totalSteps);
            },
        },
    };
}

module.exports = reporter;
