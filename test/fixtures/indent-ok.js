
'use strict';

const planify = require('../../');

function build(options) {
    return planify(options)
    .phase('foo', (phase) => {
        phase.step('bar', () => {
            process.stdout.write('foo');
            process.stdout.write('bar');
            process.stdout.write('foo\n  bar');
        });
    });
}

module.exports = build;
