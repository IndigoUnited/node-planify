'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const expect = require('expect.js');
const camelCase = require('lodash/camelCase');
const assign = require('lodash/assign');
const bufferStdio = require('../../helpers/buffer-stdio');
const fixtures = require('../../fixtures');

function expectations(reporter) {
    const expectations = {};

    glob
    .sync(__dirname + '/../expected/' + reporter + '.*')
    .forEach((file) => {
        const name = path.basename(file).substr(reporter.length + 1);
        const fixture = fixtures[camelCase(name)];
        const expected = fs.readFileSync(file).toString();

        expectations[camelCase(name)] = {
            file,
            name,
            fixture,
            expected,
            run(options) {
                options = assign({
                    reporter,
                }, options);

                const buffered = bufferStdio.start();

                return fixture(options)
                .run()
                .finally(() => bufferStdio.finish())
                .catch(() => {})
                .then(() => {
                    return [buffered, expected];
                });
            },
        };
    });

    return expectations;
}

function test(expectations, normalizer) {
    let key;

    for (key in expectations) {
        const expectation = expectations[key];

        it('should give the correct output for fixtures/' + expectation.name, () => {
            return expectation.run()
            .spread((buffered, expected) => {
                // fs.writeFileSync(expectation.file, buffered.stdout);
                expect(normalizer(buffered.stdout)).to.equal(normalizer(expected));
                expect(buffered.stderr).to.equal('');
            });
        });
    }
}

module.exports = {
    expectations,
    test,
};
