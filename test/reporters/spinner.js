'use strict';

const expect = require('chai').expect;
const spinnerReporter = require('../../reporters/spinner');
const expected = require('./helpers/expected');
const normalizers = require('./helpers/normalizers');

const expectations = expected.expectations('spinner');

function normalize(str) {
    return normalizers.errorStack(str);
}

describe('spinner', () => {
    expected.test(expectations, normalize);

    it('should use the passed in options.stdout', () => {
        let output = '';
        const stdout = { write(str) { output += str; } };

        return expectations.complexOk.run({
            reporter: spinnerReporter({ stdout }),
        })
        .spread((buffered, expected) => {
            expect(buffered).to.eql({ stdout: '', stderr: '' });
            expect(normalize(output)).to.equal(normalize(expected));
        });
    });
});
