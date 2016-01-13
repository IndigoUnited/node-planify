'use strict';

const planify = require('../../');

function build(options) {
    return planify(options)
    .step('Step', () => {
        let err;

        console.log('step.visit');

        err = new Error('Fail with detail');
        err.code = 'ESOMECODE';
        err.detail = 'This is something that will also be printed.\nIt actually supports multi-line.';
        throw err;
    });
}

module.exports = build;
