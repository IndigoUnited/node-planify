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
            err.message = 'Invalid reporter: ' + reporter;
            throw err;
        }

        reporter = factory();
    } else if (!isPlainObject(reporter)) {
        throw new Error('Reporter must be a string or a plain object');
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
    let running = false;

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

            return Promise.try(() => {
                // Setup reporter
                const reporter = setupReporter(options.reporter);

                // Run the plan
                if (running) {
                    throw new Error('Plan is already running');
                }

                running = true;

                return run(plan.node, onNotification.bind(null, reporter))
                .finally(() => {
                    running = false;
                });
            })
            // Exit automatically if options.exit is set to true
            .then(() => {
                options.exit && process.exit(0);
            }, (err) => {
                if (!options.exit) {
                    throw err;
                }

                process.exit(err.exitCode || 1);
            })
            .return(plan.node.data)
            .nodeify(done);
        },
    });
}

module.exports = planify;
