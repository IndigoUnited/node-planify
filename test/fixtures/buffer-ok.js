'use strict';

const planify = require('../../');

function build() {
    return planify()
    .step('Single step', () => {
        process.stdout.write(new Buffer('foo\n'));
        process.stderr.write(new Buffer('bar\n'));
    });
}

module.exports = build;
