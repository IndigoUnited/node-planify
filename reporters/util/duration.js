'use strict';

const util = require('util');
const chalk = require('chalk');

const colors = {
    slow: 'red',
    medium: 'yellow',
    fast: 'grey',
};

function duration(step, template) {
    const color = colors[step.info.speed];

    template = template || '%s';

    return chalk[color](util.format(template, step.info.duration + 'ms'));
}

module.exports = duration;
