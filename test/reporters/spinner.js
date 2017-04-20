'use strict';

const expect = require('chai').expect;
const expected = require('./helpers/expected');
const spinnerReporter = require('../../reporters/spinner');

const expectations = expected.expectations('spinner');

describe('spinner', () => {
    expected.test(expectations);

    it('should use the passed in options.stdout', () => {
        let output = '';
        const stdout = { write(str) { output += str; } };

        return expectations.complexOk.run({
            reporter: spinnerReporter({ stdout }),
        })
        .spread((buffered, expected) => {
            expect(buffered).to.eql({ stdout: '', stderr: '' });
            expect(output).to.equal(expected);
        });
    });
});
