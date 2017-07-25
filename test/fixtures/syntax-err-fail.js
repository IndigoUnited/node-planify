'use strict';

const planify = require('../../');

function build() {
    return planify()
    .step('Step', () => {
        console.log('step.visit');

        throw new SyntaxError('There\'s a syntax error in your code');
    });
}

module.exports = build;
