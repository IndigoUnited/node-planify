'use strict';

const assign = require('lodash/assign');
const pick = require('lodash/pick');
const indentString = require('indent-string');

function fillReferences(refs, node) {
    let ref;

    do {
        ref = (Math.random() * 10000000000000000000).toString(36);
    } while (refs[ref]);

    node.ref = ref;
    refs[ref] = pick(node, 'type', 'label', 'depth', 'options');

    if (node.type !== 'step') {
        node.children.forEach((child) => fillReferences(refs, child));
    }

    return refs;
}

function mapInfo(node) {
    const info = Object.assign({}, node.info);

    if (info.error) {
        info.error = pick(node.info.error, 'message', 'code', 'detail');
    }

    return info;
}

function reporter(options) {
    let refs;

    options = assign({
        stdout: process.stdout,
    }, options);

    // Need to grab references to the write methods because of step.write.* methods
    const stdout = options.stdout.write.bind(options.stdout);

    return {
        plan: {
            start(plan) {
                refs = fillReferences({}, plan);

                options.stdout.write('{\n');
                options.stdout.write('  "refs": {\n');
                options.stdout.write(indentString(JSON.stringify(refs, null, 2).slice(2, -1), '  ', 1));
                options.stdout.write('  },\n');

                options.stdout.write('  "actions": [\n');

                const obj = { name: 'plan.start', ref: plan.ref };

                options.stdout.write(indentString(JSON.stringify(obj, null, 2), '  ', 2) + ',\n');
            },
            ok(plan) {
                const obj = { name: 'plan.ok', ref: plan.ref, info: mapInfo(plan) };

                options.stdout.write(indentString(JSON.stringify(obj, null, 2), '  ', 2) + ',\n');
            },
            fail(plan) {
                const obj = { name: 'plan.fail', ref: plan.ref, info: mapInfo(plan) };

                options.stdout.write(indentString(JSON.stringify(obj, null, 2), '  ', 2) + ',\n');
            },
            finish(plan) {
                const obj = { name: 'plan.finish', ref: plan.ref, info: mapInfo(plan) };

                options.stdout.write(indentString(JSON.stringify(obj, null, 2), '  ', 2) + '\n');
                options.stdout.write('  ]\n');
                options.stdout.write('}\n');
            },
        },

        phase: {
            start(phase) {
                const obj = { name: 'phase.start', ref: phase.ref };

                options.stdout.write(indentString(JSON.stringify(obj, null, 2), '  ', 2) + ',\n');
            },
            ok(phase) {
                const obj = { name: 'phase.ok', ref: phase.ref, info: mapInfo(phase) };

                options.stdout.write(indentString(JSON.stringify(obj, null, 2), '  ', 2) + ',\n');
            },
            fail(phase) {
                const obj = { name: 'phase.fail', ref: phase.ref, info: mapInfo(phase) };

                options.stdout.write(indentString(JSON.stringify(obj, null, 2), '  ', 2) + ',\n');
            },
            finish(phase) {
                const obj = { name: 'phase.finish', ref: phase.ref, info: mapInfo(phase) };

                options.stdout.write(indentString(JSON.stringify(obj, null, 2), '  ', 2) + ',\n');
            },
        },

        step: {
            start(step) {
                const obj = { name: 'step.start', ref: step.ref };

                options.stdout.write(indentString(JSON.stringify(obj, null, 2), '  ', 2) + ',\n');
            },
            write: {
                stdout(step, str) {
                    const obj = { name: 'step.write.stdout', ref: step.ref, str: '' + str };  // str can be a buffer

                    stdout(indentString(JSON.stringify(obj, null, 2), '  ', 2) + ',\n');
                },
                stderr(step, str) {
                    const obj = { name: 'step.write.stderr', ref: step.ref, str: '' + str };  // str can be a buffer

                    stdout(indentString(JSON.stringify(obj, null, 2), '  ', 2) + ',\n');
                },
            },
            ok(step) {
                const obj = { name: 'step.ok', ref: step.ref, info: mapInfo(step) };

                options.stdout.write(indentString(JSON.stringify(obj, null, 2), '  ', 2) + ',\n');
            },
            fail(step) {
                const obj = { name: 'step.fail', ref: step.ref, info: mapInfo(step) };

                options.stdout.write(indentString(JSON.stringify(obj, null, 2), '  ', 2) + ',\n');
            },
            finish(step) {
                const obj = { name: 'step.finish', ref: step.ref, info: mapInfo(step) };

                options.stdout.write(indentString(JSON.stringify(obj, null, 2), '  ', 2) + ',\n');
            },
        },
    };
}

module.exports = reporter;
