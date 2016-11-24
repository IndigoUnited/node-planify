'use strict';

const Promise = require('bluebird');
const onExit = require('signal-exit');
const stdio = require('./stdio');

function calculateSpeed(node) {
    const duration = node.info.duration;
    const slow = node.type === 'step'
        ? node.options.slow :
        node.steps.reduce((sum, step) => sum + step.options.slow, 0);

    if (slow > 0) {
        if (duration >= slow) {
            return 'slow';
        }

        if (duration >= slow / 2) {
            return 'medium';
        }
    }

    return 'fast';
}

function collectInfo(node) {
    node.info = {
        startedAt: Date.now(),
    };

    return {
        ok(data) {
            node.info.finishedAt = Date.now();
            node.info.duration = node.info.finishedAt - node.info.startedAt;
            node.info.speed = calculateSpeed(node);

            return data;
        },
        fail(err) {
            node.info.error = err;
            throw err;
        },
    };
}

function hookStepStdio(step, notify) {
    const stdioPromises = [];

    if (step.options.mute.stdout) {
        stdio.stdout.hook(() => {});
    } else {
        stdio.stdout.hook((str, encoding) => {
            stdioPromises.push(notify(step, 'write.stdout', str, encoding));
        });
    }

    if (step.options.mute.stderr) {
        stdio.stderr.hook(() => {});
    } else {
        stdio.stderr.hook((str, encoding) => {
            stdioPromises.push(notify(step, 'write.stderr', str, encoding));
        });
    }

    return () => {
        stdio.unhook();

        return Promise.all(stdioPromises);
    };
}

function runStep(step, notify) {
    // Fill initial info
    const finalizeInfo = collectInfo(step);

    // Hook into the stdio
    const unhookStdio = hookStepStdio(step, notify);

    // Run actually step function
    return step.fn(step.plan.data)
    // Finalize info collection
    .then(finalizeInfo.ok, finalizeInfo.fail)
    // Unhook stdio & wait for it to flush
    .finally(() => {
        return unhookStdio();
    })
    // Notify success or failure
    .then(() => {
        return notify(step, 'ok');
    }, (err) => {
        return notify(step, 'fail', err)
        .finally(() => {
            // Should we ignore the error?
            if (step.options.fatal) {
                throw err;
            }
        });
    });
}

function runPhase(phase, notify) {
    // Fill initial info
    const finalizeInfo = collectInfo(phase);

    // Chain each phase items into a single promise
    let promise = Promise.resolve();

    phase.children.forEach((child) => {
        promise = promise.then(() => {
            return run(child, notify);
        });
    });

    return promise
    // Finalize info collection
    .then(finalizeInfo.ok, finalizeInfo.fail)
    // Notify success or failure
    .then(() => {
        return notify(phase, 'ok');
    }, (err) => {
        return notify(phase, 'fail', err)
        .finally(() => { throw err; });
    });
}

function run(node, notify) {
    // Notify finish if the process ends prematurely
    const cancelOnExit = onExit(() => {
        /* istanbul ignore next  */
        notify(node, 'finish');
    });

    // Notify start
    return notify(node, 'start')
    // Run the phase or step
    .then(() => node.type === 'step' ? runStep(node, notify) : runPhase(node, notify))
    // Notify finish
    .finally(() => {
        cancelOnExit();
        return notify(node, 'finish');
    });
}

module.exports = run;
