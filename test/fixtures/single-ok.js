'use strict';

const planify = require('../../');

function build() {
    return planify()
    .step('Single step', () => {
        console.log('single-step.visit');
    });
}

module.exports = build;
