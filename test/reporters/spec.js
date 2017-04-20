'use strict';

const expect = require('chai').expect;
const specReporter = require('../../reporters/spec');
const expected = require('./helpers/expected');
const normalizers = require('./helpers/normalizers');

function normalize(str) {
    return normalizers.duration(normalizers.symbols(normalizers.errorStack(str)));
}

const expectations = expected.expectations('spec');

describe('spec', () => {
    expected.test(expectations, normalize);

    it('should use the passed in options.stdout', () => {
        let output = '';
        const stdout = { write(str) { output += str; } };

        return expectations.complexOk.run({
            reporter: specReporter({ stdout }),
        })
        .spread((buffered, expected) => {
            expect(buffered).to.eql({ stdout: '', stderr: '' });
            expect(normalize(output)).to.equal(normalize(expected));
        });
    });
});
