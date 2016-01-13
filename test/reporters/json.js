'use strict';

const expect = require('chai').expect;
const jsonReporter = require('../../reporters/json');
const expected = require('./helpers/expected');

function normalize(str) {
    const obj = JSON.parse(str);

    // Normalize references
    Object.keys(obj.refs).forEach((id, index) => {
        const ref = obj.refs[id];

        delete obj.refs[id];
        obj.refs[index + 1] = ref;

        obj.actions.forEach((action) => {
            if (action.ref === id) {
                action.ref = index + 1;
            }
        });
    });

    // Normalize info
    obj.actions.forEach((action, index) => {
        if (!action.info) {
            return;
        }

        if (action.info.startedAt != null) {
            action.info.startedAt = index + 1;
        }
        if (action.info.finishedAt != null) {
            action.info.finishedAt = index + 1;
        }
        if (action.info.duration != null) {
            action.info.duration = index + 1;
        }
    });

    return JSON.stringify(obj, null, '  ');
}

const expectations = expected.expectations('json');

describe('json', () => {
    expected.test(expectations, normalize);

    it('should use the passed in options.stdout', () => {
        let output = '';
        const stdout = { write(str) { output += str; } };

        return expectations.complexOk.run({
            reporter: jsonReporter({ stdout }),
        })
        .spread((buffered, expected) => {
            expect(buffered).to.eql({ stdout: '', stderr: '' });
            expect(normalize(output)).to.equal(normalize(expected));
        });
    });
});
