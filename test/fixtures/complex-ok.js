'use strict';

const Promise = require('bluebird');
const planify = require('../../');

function build(options) {
    return planify(options)
    .step('Step 1 - Sync', () => {
        console.log('step-1.visit');
    })
    .step('Step 2 - Promise', () => {
        console.log('step-2.enter');

        return Promise.delay(10)
        .then(() => {
            console.log('step-2.leave');
        });
    })
    .step('Step 3 - Callback', (data, done) => {
        console.log('step-3.enter');

        setTimeout(() => {
            console.log('step-3.leave');
            done();
        }, 201);
    })
    .phase('Phase 1', (phase) => {
        phase.step('Step 4 - Promise', () => {
            console.log('step-4.enter');

            return Promise.delay(101)
            .then(() => {
                console.log('step-4.leave');
            });
        });

        phase.phase('Phase 1.1', (phase) => {
            phase.step('Step 5 - Sync', { fatal: false }, () => {
                console.log('step-5.visit');
                console.error('Will throw an error');
                throw new Error('Will be ignored');
            });
        });
    })
    .phase('Phase 2', (phase) => {
        phase.step('Step 6 - Sync', (data, done) => {
            console.log('step-6.enter');

            setTimeout(() => {
                console.log('step-6.leave');
                done();
            }, 10);
        });

        phase.step('Step 7 - Multiple writes', () => {
            console.log('step-7.visit');
            process.stdout.write('foo\nbar');
            process.stdout.write('baz\nhello\n');
            process.stdout.write('there');
            process.stdout.write('\n');
        });
    })
    .step('Step 8 - Sync', () => {
        console.log('step-8.visit');
    });
}

module.exports = build;
