'use strict';

const expect = require('chai').expect;
const blocksReporter = require('../../reporters/blocks');
const expected = require('./helpers/expected');
const normalizers = require('./helpers/normalizers');

function normalize(str) {
    return normalizers.duration(normalizers.symbols(str));
}

const expectations = expected.expectations('blocks');

describe('blocks', () => {
    expected.test(expectations, normalize);

    it('should use the passed in options.stdout', () => {
        let output = '';
        const stdout = { write(str) { output += str; } };

        return expectations.complexOk.run({
            reporter: blocksReporter({ stdout }),
        })
        .spread((buffered, expected) => {
            expect(buffered).to.eql({ stdout: '', stderr: '' });
            expect(normalize(output)).to.equal(normalize(expected));
        });
    });
});
