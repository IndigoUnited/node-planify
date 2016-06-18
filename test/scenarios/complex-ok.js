'use strict';

const expect = require('chai').expect;
const omitBy = require('lodash/omitBy');
const fixtures = require('../fixtures');
const jsonReporter = require('../../reporters/json');

it('should run scenarios/complex-ok, verifying the order and the reporter integration', () => {
    let stdout = '';
    const reporter = jsonReporter({
        stdout: {
            write: (str) => {
                stdout += str;
            },
        },
    });

    return fixtures.complexOk({ reporter })
    .run()
    .then(() => {
        const json = JSON.parse(stdout.trim());
        const actions = json.actions.map((action) => {
            return omitBy({
                label: json.refs[action.ref].label,
                action: action.name,
                str: action.str,
            }, (val) => !val);
        });

        expect(actions).to.eql([
            { label: 'Plan', action: 'plan.start' },
            { label: 'Step 1 - Sync', action: 'step.start' },
            { label: 'Step 1 - Sync', action: 'step.write.stdout', str: 'step-1.visit\n' },
            { label: 'Step 1 - Sync', action: 'step.ok' },
            { label: 'Step 1 - Sync', action: 'step.finish' },
            { label: 'Step 2 - Promise', action: 'step.start' },
            { label: 'Step 2 - Promise', action: 'step.write.stdout', str: 'step-2.enter\n' },
            { label: 'Step 2 - Promise', action: 'step.write.stdout', str: 'step-2.leave\n' },
            { label: 'Step 2 - Promise', action: 'step.ok' },
            { label: 'Step 2 - Promise', action: 'step.finish' },
            { label: 'Step 3 - Callback', action: 'step.start' },
            { label: 'Step 3 - Callback', action: 'step.write.stdout', str: 'step-3.enter\n' },
            { label: 'Step 3 - Callback', action: 'step.write.stdout', str: 'step-3.leave\n' },
            { label: 'Step 3 - Callback', action: 'step.ok' },
            { label: 'Step 3 - Callback', action: 'step.finish' },
            { label: 'Phase 1', action: 'phase.start' },
            { label: 'Step 4 - Promise', action: 'step.start' },
            { label: 'Step 4 - Promise', action: 'step.write.stdout', str: 'step-4.enter\n' },
            { label: 'Step 4 - Promise', action: 'step.write.stdout', str: 'step-4.leave\n' },
            { label: 'Step 4 - Promise', action: 'step.ok' },
            { label: 'Step 4 - Promise', action: 'step.finish' },
            { label: 'Phase 1.1', action: 'phase.start' },
            { label: 'Step 5 - Sync', action: 'step.start' },
            { label: 'Step 5 - Sync', action: 'step.write.stdout', str: 'step-5.visit\n' },
            { label: 'Step 5 - Sync', action: 'step.write.stderr', str: 'Will throw an error\n' },
            { label: 'Step 5 - Sync', action: 'step.fail' },
            { label: 'Step 5 - Sync', action: 'step.finish' },
            { label: 'Phase 1.1', action: 'phase.ok' },
            { label: 'Phase 1.1', action: 'phase.finish' },
            { label: 'Phase 1', action: 'phase.ok' },
            { label: 'Phase 1', action: 'phase.finish' },
            { label: 'Phase 2', action: 'phase.start' },
            { label: 'Step 6 - Sync', action: 'step.start' },
            { label: 'Step 6 - Sync', action: 'step.write.stdout', str: 'step-6.enter\n' },
            { label: 'Step 6 - Sync', action: 'step.write.stdout', str: 'step-6.leave\n' },
            { label: 'Step 6 - Sync', action: 'step.ok' },
            { label: 'Step 6 - Sync', action: 'step.finish' },
            { label: 'Step 7 - Multiple writes', action: 'step.start' },
            { label: 'Step 7 - Multiple writes', action: 'step.write.stdout', str: 'step-7.visit\n' },
            { label: 'Step 7 - Multiple writes', action: 'step.write.stdout', str: 'foo\nbar' },
            { label: 'Step 7 - Multiple writes', action: 'step.write.stdout', str: 'baz\nhello\n' },
            { label: 'Step 7 - Multiple writes', action: 'step.write.stdout', str: 'there' },
            { label: 'Step 7 - Multiple writes', action: 'step.write.stdout', str: '\n' },
            { label: 'Step 7 - Multiple writes', action: 'step.ok' },
            { label: 'Step 7 - Multiple writes', action: 'step.finish' },
            { label: 'Phase 2', action: 'phase.ok' },
            { label: 'Phase 2', action: 'phase.finish' },
            { label: 'Step 8 - Sync', action: 'step.start' },
            { label: 'Step 8 - Sync', action: 'step.write.stdout', str: 'step-8.visit\n' },
            { label: 'Step 8 - Sync', action: 'step.ok' },
            { label: 'Step 8 - Sync', action: 'step.finish' },
            { label: 'Plan', action: 'plan.ok' },
            { label: 'Plan', action: 'plan.finish' },
        ]);
    });
});
