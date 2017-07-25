'use strict';

const planify = require('../../');

function build() {
    return planify()
    .step('Step', () => {
        console.log('step.visit');

        const err = new Error('Fail with detail');

        err.code = 'ESOMECODE';
        err.detail = 'This is something that will also be printed.\nIt actually supports multi-line.';
        throw err;
    });
}

module.exports = build;
