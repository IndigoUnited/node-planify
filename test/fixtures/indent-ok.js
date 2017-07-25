
'use strict';

const planify = require('../../');

function build() {
    return planify()
    .phase('foo', (phase) => {
        phase.step('bar', () => {
            process.stdout.write('foo');
            process.stdout.write('bar');
            process.stdout.write('foo\n  bar');
        });
    });
}

module.exports = build;
