'use strict';

const expect = require('chai').expect;
const omitBy = require('lodash/omitBy');
const fixtures = require('../fixtures');
const jsonReporter = require('../../reporters/json');

it('should run scenarios/complex-fail, verifying the order and the reporter integration', () => {
    let stdout = '';
    const reporter = jsonReporter({
        stdout: {
            write: (str) => {
                stdout += str;
            },
        },
    });

    return fixtures.complexFail({ reporter })
    .run()
    .then(() => {
        throw new Error('Should have failed');
    }, () => {
        const json = JSON.parse(stdout.trim());
        const actions = json.actions.map((action) => {
            return omitBy({ label: json.refs[action.ref].label, action: action.name, str: action.str,
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
            { label: 'Phase 1.1', action: 'phase.fail' },
            { label: 'Phase 1.1', action: 'phase.finish' },
            { label: 'Phase 1', action: 'phase.fail' },
            { label: 'Phase 1', action: 'phase.finish' },
            { label: 'Plan', action: 'plan.fail' },
            { label: 'Plan', action: 'plan.finish' },
        ]);
    });
});
