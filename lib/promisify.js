'use strict';

const Promise = require('bluebird');
const get = require('lodash/get');
const set = require('lodash/set');
const cloneDeep = require('lodash/cloneDeep');

function promisify(fn, length) {
    // Check if this is callback usage
    if (fn.length > length) {
        return function () {
            const args = Array.from(arguments);

            return new Promise((resolve, reject) => {
                args.push((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });

                fn.apply(null, args);
            });
        };
    }

    // Otherwise its a promise or a sync return value
    return function () {
        try {
            return Promise.resolve(fn.apply(null, arguments));
        } catch (err) {
            return Promise.reject(err);
        }
    };
}

const reporterMethods = [
    { name: 'start', length: 1 },
    { name: 'ok', length: 1 },
    { name: 'fail', length: 2 },
    { name: 'finish', length: 1 },

    { name: 'phase.start', length: 1 },
    { name: 'phase.ok', length: 1 },
    { name: 'phase.fail', length: 2 },
    { name: 'phase.finish', length: 1 },

    { name: 'step.start', length: 1 },
    { name: 'step.write.stdout', length: 4 },
    { name: 'step.write.stderr', length: 4 },
    { name: 'step.ok', length: 1 },
    { name: 'step.fail', length: 2 },
    { name: 'step.finish', length: 1 },
];

function promisifyReporter(reporter) {
    reporter = cloneDeep(reporter);

    reporterMethods.forEach((method) => {
        const fn = get(reporter, method.name);

        if (fn) {
            set(reporter, method.name, promisify(fn, method.length));
        }
    });

    return reporter;
}

module.exports = promisify;
module.exports.reporter = promisifyReporter;
