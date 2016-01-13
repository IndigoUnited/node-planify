'use strict';

const original = { stdout: process.stdout.write, stderr: process.stderr.write };
let output;

function start() {
    output = { stdout: '', stderr: '' };

    process.stdout.write = (str) => { output.stdout += str; };
    process.stderr.write = (str) => { output.stderr += str; };

    return output;
}

function finish() {
    process.stdout.write = original.stdout;
    process.stderr.write = original.stderr;

    return output;
}

module.exports = {
    start,
    finish,
};
