/* eslint global-require:0 */

'use strict';

const Promise = require('bluebird');
const merge = require('lodash/object/merge');
const get = require('lodash/object/get');
const run = require('./lib/run');
const promisify = require('./lib/promisify');
const build = require('./lib/build');

function setupReporter(reporter) {
    // If it is a string, import built-in reporter
    if (typeof reporter === 'string') {
        let factory;

        try {
            factory = require('./reporters/' + reporter);
        } catch (err) {
            err.message = 'Invalid reporter: ' + reporter;
            throw err;
        }

        reporter = factory();
    }

    // Finally promisify it
    return promisify.reporter(reporter);
}

function onNotification(reporter, node, action) {
    const reporterFn = get(reporter, node.type + '.' + action);
    let args;

    args = Array.from(arguments).slice(3);
    args.unshift(node);

    return Promise.resolve(reporterFn && reporterFn.apply(null, args));
}

function planify(options) {
    options = merge({
        reporter: 'blocks',
        exit: false,
    }, options);

    const reporter = setupReporter(options.reporter);
    const plan = build();
    let didRun = false;

    return merge(plan, {
        getNode() {
            return plan.node;
        },

        getReporter() {
            return reporter;
        },

        run(data, done) {
            if (typeof data === 'function') {
                done = data;
                data = null;
            }

            // Check if already run
            if (didRun) {
                return Promise.reject(new Error('This plan has already run'))
                .nodeify(done);
            }

            // Check if another plan is running..
            if (global.$planifyRunning) {
                return Promise.reject(new Error('Another plan is already running'))
                .nodeify(done);
            }

            // Run actual plan
            global.$planifyRunning = true;  // Use global because several versions might be used
            didRun = true;

            // Fill initial data if necessary
            if (data) {
                plan.node.data = data;
            }

            let promise = run(plan.node, onNotification.bind(null, reporter))
            .finally(() => {
                global.$planifyRunning = false;
            });

            // Exit automatically if options.exit is set to true
            if (options.exit) {
                promise = promise
                .then(() => process.exit(0), (err) => process.exit(err.exitCode || 1));
            }

            return promise
            .return(plan.node.data)
            .nodeify(done);
        },
    });
}

module.exports = planify;
