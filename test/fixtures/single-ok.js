'use strict';

const planify = require('../../');

function build(options) {
    return planify(options)
    .step('Single step', () => {
        console.log('single-step.visit');
    });
}

module.exports = build;
