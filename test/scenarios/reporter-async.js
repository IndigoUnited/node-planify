'use strict';

const Promise = require('bluebird');
const expect = require('chai').expect;
const pick = require('lodash/pick');
const fixtures = require('../fixtures');

it('should run scenarios/reporter-async, verifying if the reporter asynchrony is respected', function () {
    this.timeout(4000);

    let stack;
    const delay = 51;
    const reporter = {
        plan: {
            start() {
                const now = Date.now();

                stack = [];
                stack.push({ action: 'plan.start' });

                return Promise.delay(delay)
                .then(() => stack.push({ action: 'plan.start.delay', delay: Date.now() - now }));
            },
            ok() {
                const now = Date.now();

                stack.push({ action: 'plan.ok' });

                return Promise.delay(delay)
                .then(() => stack.push({ action: 'plan.ok.delay', delay: Date.now() - now }));
            },
            fail() {
                const now = Date.now();

                stack.push({ action: 'plan.fail' });

                return Promise.delay(delay)
                .then(() => stack.push({ action: 'plan.fail.delay', delay: Date.now() - now }));
            },
            finish() {
                const now = Date.now();

                stack.push({ action: 'plan.finish' });

                return Promise.delay(delay)
                .then(() => stack.push({ action: 'plan.finish.delay', delay: Date.now() - now }));
            },
        },
        phase: {
            start(phase) {
                const now = Date.now();

                stack.push({ action: 'phase.start', label: phase.label });

                return Promise.delay(delay)
                .then(() => stack.push({ action: 'phase.start.delay', label: phase.label, delay: Date.now() - now }));
            },
            ok(phase) {
                const now = Date.now();

                stack.push({ action: 'phase.ok', label: phase.label });

                return Promise.delay(delay)
                .then(() => stack.push({ action: 'phase.ok.delay', label: phase.label, delay: Date.now() - now }));
            },
            fail(phase) {
                const now = Date.now();

                stack.push({ action: 'phase.fail', label: phase.label });

                return Promise.delay(delay)
                .then(() => stack.push({ action: 'phase.fail.delay', label: phase.label, delay: Date.now() - now }));
            },
            finish(phase) {
                const now = Date.now();

                stack.push({ action: 'phase.finish', label: phase.label });

                return Promise.delay(delay)
                .then(() => stack.push({ action: 'phase.finish.delay', label: phase.label, delay: Date.now() - now }));
            },
        },
        step: {
            start(step) {
                const now = Date.now();

                stack.push({ action: 'step.start', label: step.label });

                return Promise.delay(delay)
                .then(() => stack.push({ action: 'step.start.delay', label: step.label, delay: Date.now() - now }));
            },
            ok(step) {
                const now = Date.now();

                stack.push({ action: 'step.ok', label: step.label });

                return Promise.delay(delay)
                .then(() => stack.push({ action: 'step.ok.delay', label: step.label, delay: Date.now() - now }));
            },
            fail(step) {
                const now = Date.now();

                stack.push({ action: 'step.fail', label: step.label });

                return Promise.delay(delay)
                .then(() => stack.push({ action: 'step.fail.delay', label: step.label, delay: Date.now() - now }));
            },
            finish(step) {
                const now = Date.now();

                stack.push({ action: 'step.finish', label: step.label });

                return Promise.delay(delay)
                .then(() => stack.push({ action: 'step.finish.delay', label: step.label, delay: Date.now() - now }));
            },
            write: {
                stdout(step, str) {
                    const now = Date.now();

                    stack.push({ action: 'step.write.stdout', label: step.label, str });

                    return Promise.delay(delay)
                    .then(() => stack.push({
                        action: 'step.write.stdout.delay',
                        label: step.label,
                        str,
                        delay: Date.now() - now,
                    }));
                },
                stderr(step, str) {
                    const now = Date.now();

                    stack.push({ action: 'step.write.stderr', label: step.label, str });

                    return Promise.delay(delay)
                    .then(() => stack.push({
                        action: 'step.write.stderr.delay',
                        label: step.label,
                        str,
                        delay: Date.now() - now,
                    }));
                },
            },
        },
    };

    return fixtures.complexOk({ reporter })
    .run()
    .then(() => {
        // Check stack without durations
        const normalizedStack = stack.map((item) => {
            return pick(item, 'action', 'label', 'str');
        });

        expect(normalizedStack).to.eql([
            { action: 'plan.start' },
            { action: 'plan.start.delay' },
            { action: 'step.start', label: 'Step 1 - Sync' },
            { action: 'step.start.delay', label: 'Step 1 - Sync' },
            { action: 'step.write.stdout', label: 'Step 1 - Sync', str: 'step-1.visit\n' },
            { action: 'step.write.stdout.delay', label: 'Step 1 - Sync', str: 'step-1.visit\n' },
            { action: 'step.ok', label: 'Step 1 - Sync' },
            { action: 'step.ok.delay', label: 'Step 1 - Sync' },
            { action: 'step.finish', label: 'Step 1 - Sync' },
            { action: 'step.finish.delay', label: 'Step 1 - Sync' },
            { action: 'step.start', label: 'Step 2 - Promise' },
            { action: 'step.start.delay', label: 'Step 2 - Promise' },
            { action: 'step.write.stdout', label: 'Step 2 - Promise', str: 'step-2.enter\n' },
            { action: 'step.write.stdout.delay', label: 'Step 2 - Promise', str: 'step-2.enter\n' },
            { action: 'step.write.stdout', label: 'Step 2 - Promise', str: 'step-2.leave\n' },
            { action: 'step.write.stdout.delay', label: 'Step 2 - Promise', str: 'step-2.leave\n' },
            { action: 'step.ok', label: 'Step 2 - Promise' },
            { action: 'step.ok.delay', label: 'Step 2 - Promise' },
            { action: 'step.finish', label: 'Step 2 - Promise' },
            { action: 'step.finish.delay', label: 'Step 2 - Promise' },
            { action: 'step.start', label: 'Step 3 - Callback' },
            { action: 'step.start.delay', label: 'Step 3 - Callback' },
            { action: 'step.write.stdout', label: 'Step 3 - Callback', str: 'step-3.enter\n' },
            { action: 'step.write.stdout.delay', label: 'Step 3 - Callback', str: 'step-3.enter\n' },
            { action: 'step.write.stdout', label: 'Step 3 - Callback', str: 'step-3.leave\n' },
            { action: 'step.write.stdout.delay', label: 'Step 3 - Callback', str: 'step-3.leave\n' },
            { action: 'step.ok', label: 'Step 3 - Callback' },
            { action: 'step.ok.delay', label: 'Step 3 - Callback' },
            { action: 'step.finish', label: 'Step 3 - Callback' },
            { action: 'step.finish.delay', label: 'Step 3 - Callback' },
            { action: 'phase.start', label: 'Phase 1' },
            { action: 'phase.start.delay', label: 'Phase 1' },
            { action: 'step.start', label: 'Step 4 - Promise' },
            { action: 'step.start.delay', label: 'Step 4 - Promise' },
            { action: 'step.write.stdout', label: 'Step 4 - Promise', str: 'step-4.enter\n' },
            { action: 'step.write.stdout.delay', label: 'Step 4 - Promise', str: 'step-4.enter\n' },
            { action: 'step.write.stdout', label: 'Step 4 - Promise', str: 'step-4.leave\n' },
            { action: 'step.write.stdout.delay', label: 'Step 4 - Promise', str: 'step-4.leave\n' },
            { action: 'step.ok', label: 'Step 4 - Promise' },
            { action: 'step.ok.delay', label: 'Step 4 - Promise' },
            { action: 'step.finish', label: 'Step 4 - Promise' },
            { action: 'step.finish.delay', label: 'Step 4 - Promise' },
            { action: 'phase.start', label: 'Phase 1.1' },
            { action: 'phase.start.delay', label: 'Phase 1.1' },
            { action: 'step.start', label: 'Step 5 - Sync' },
            { action: 'step.start.delay', label: 'Step 5 - Sync' },
            { action: 'step.write.stdout', label: 'Step 5 - Sync', str: 'step-5.visit\n' },
            { action: 'step.write.stdout.delay', label: 'Step 5 - Sync', str: 'step-5.visit\n' },
            { action: 'step.write.stderr', label: 'Step 5 - Sync', str: 'Will throw an error\n' },
            { action: 'step.write.stderr.delay', label: 'Step 5 - Sync', str: 'Will throw an error\n' },
            { action: 'step.fail', label: 'Step 5 - Sync' },
            { action: 'step.fail.delay', label: 'Step 5 - Sync' },
            { action: 'step.finish', label: 'Step 5 - Sync' },
            { action: 'step.finish.delay', label: 'Step 5 - Sync' },
            { action: 'phase.ok', label: 'Phase 1.1' },
            { action: 'phase.ok.delay', label: 'Phase 1.1' },
            { action: 'phase.finish', label: 'Phase 1.1' },
            { action: 'phase.finish.delay', label: 'Phase 1.1' },
            { action: 'phase.ok', label: 'Phase 1' },
            { action: 'phase.ok.delay', label: 'Phase 1' },
            { action: 'phase.finish', label: 'Phase 1' },
            { action: 'phase.finish.delay', label: 'Phase 1' },
            { action: 'phase.start', label: 'Phase 2' },
            { action: 'phase.start.delay', label: 'Phase 2' },
            { action: 'step.start', label: 'Step 6 - Sync' },
            { action: 'step.start.delay', label: 'Step 6 - Sync' },
            { action: 'step.write.stdout', label: 'Step 6 - Sync', str: 'step-6.enter\n' },
            { action: 'step.write.stdout.delay', label: 'Step 6 - Sync', str: 'step-6.enter\n' },
            { action: 'step.write.stdout', label: 'Step 6 - Sync', str: 'step-6.leave\n' },
            { action: 'step.write.stdout.delay', label: 'Step 6 - Sync', str: 'step-6.leave\n' },
            { action: 'step.ok', label: 'Step 6 - Sync' },
            { action: 'step.ok.delay', label: 'Step 6 - Sync' },
            { action: 'step.finish', label: 'Step 6 - Sync' },
            { action: 'step.finish.delay', label: 'Step 6 - Sync' },
            { action: 'phase.ok', label: 'Phase 2' },
            { action: 'phase.ok.delay', label: 'Phase 2' },
            { action: 'phase.finish', label: 'Phase 2' },
            { action: 'phase.finish.delay', label: 'Phase 2' },
            { action: 'step.start', label: 'Step 7 - Sync' },
            { action: 'step.start.delay', label: 'Step 7 - Sync' },
            { action: 'step.write.stdout', label: 'Step 7 - Sync', str: 'step-7.visit\n' },
            { action: 'step.write.stdout.delay', label: 'Step 7 - Sync', str: 'step-7.visit\n' },
            { action: 'step.ok', label: 'Step 7 - Sync' },
            { action: 'step.ok.delay', label: 'Step 7 - Sync' },
            { action: 'step.finish', label: 'Step 7 - Sync' },
            { action: 'step.finish.delay', label: 'Step 7 - Sync' },
            { action: 'plan.ok' },
            { action: 'plan.ok.delay' },
            { action: 'plan.finish' },
            { action: 'plan.finish.delay' },
        ]);

        // Check if delays are respected
        stack.forEach((item, index) => {
            if (index % 2 !== 0) {
                expect(item.delay).to.be.gte(delay - 1);
            }
        });
    });
});
