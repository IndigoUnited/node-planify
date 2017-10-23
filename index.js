/* eslint global-require:0 */

'use strict';

const Promise = require('bluebird');
const merge = require('lodash/merge');
const get = require('lodash/get');
const isPlainObject = require('lodash/isPlainObject');
const run = require('./lib/run');
const promisify = require('./lib/promisify');
const build = require('./lib/build');

function setupReporter(reporter) {
    reporter = reporter || 'blocks';

    // If it is a string, import built-in reporter
    if (typeof reporter === 'string') {
        let factory;

        try {
            factory = require('./reporters/' + reporter);
        } catch (err) {
            err.message = 'Unknown reporter: ' + reporter;
            throw err;
        }

        reporter = factory();
    } else if (!isPlainObject(reporter)) {
        throw new TypeError('Reporter must be a string or a plain object');
    }

    // Finally promisify it
    return promisify.reporter(reporter);
}

function onNotification(reporter, node, action) {
    const reporterFn = get(reporter, node.type + '.' + action);
    const args = Array.from(arguments).slice(3);

    args.unshift(node);

    return Promise.resolve(reporterFn && reporterFn.apply(null, args));
}

function planify(data) {
    const plan = build(data);

    return merge(plan, {
        getNode() {
            return plan.node;
        },

        run(options, done) {
            if (typeof options === 'function') {
                done = options;
                options = null;
            }

            options = Object.assign({
                reporter: 'blocks',
                exit: false,
            }, options);

            // Setup reporter
            const reporter = setupReporter(options.reporter);

            // Check if a plan is running
            if (global.$planifyRunning) {
                throw new Error('A plan is already running');
            }

            // Run actual plan
            global.$planifyRunning = true;  // Use global because several versions might be used

            return run(plan.node, onNotification.bind(null, reporter))
            .finally(() => {
                global.$planifyRunning = false;
            })
            // Exit automatically if options.exit is set to true
            .then(() => {
                options.exit && process.exit(0);
            }, (err) => {
                if (!options.exit) {
                    throw err;
                }

                process.exit(err.exitCode || 1);

                // This is necessary if the `process.exit()` is being mocked. This way it is possible
                // to catch the error and assert it accordingly.
                throw err;
            })
            .return(plan.node.data)
            .nodeify(done);
        },
    });
}

module.exports = planify;
