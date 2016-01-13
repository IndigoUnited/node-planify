'use strict';

const promisify = require('./promisify');
const merge = require('lodash/object/merge');

function assertPlanNotRunning(planNode) {
    if (planNode.info && planNode.info.startedAt) {
        throw new Error('Can\'t modify plan when is already running');
    }
}

function linkNodeAndExports(node, exports) {
    Object.defineProperty(exports, 'node', {
        value: node,
        writable: false,
        enumerable: false,
        configurable: false,
    });
    Object.defineProperty(node, 'exports', {
        value: exports,
        writable: false,
        enumerable: false,
        configurable: false,
    });
}

function createPhase(parentNode, label, fn) {
    const planNode = parentNode.plan || parentNode;

    assertPlanNotRunning(planNode);

    const node = {
        plan: planNode,
        parent: parentNode,
        depth: parentNode.depth + 1,
        type: 'phase',
        label,
        children: [],
        steps: [],
    };

    const exports = {
        phase: createPhase.bind(null, node),
        step: createStep.bind(null, node),
    };

    parentNode.children.push(node);
    linkNodeAndExports(node, exports);

    fn(exports);

    return parentNode.exports;
}

function createStep(parentNode, label, options, fn) {
    const planNode = parentNode.plan || parentNode;

    assertPlanNotRunning(planNode);

    if (typeof options === 'function') {
        fn = options;
        options = null;
    }

    options = merge({
        mute: false,
        fatal: true,
        slow: 200,
    }, options);

    const node = {
        plan: planNode,
        parent: parentNode,
        depth: parentNode.depth + 1,
        type: 'step',
        label,
        options,
        fn: promisify(fn, 1),
    };

    parentNode.children.push(node);

    // Add this step to all its ancestors
    let ancestorNode = parentNode;

    do {
        ancestorNode.steps.push(node);
    } while ((ancestorNode = ancestorNode.parent));

    return parentNode.exports;
}

function builder() {
    const node = {
        depth: -1,
        type: 'plan',
        label: 'Plan',
        children: [],
        steps: [],
        data: {},
    };

    const exports = {
        phase: createPhase.bind(null, node),
        step: createStep.bind(null, node),
    };

    linkNodeAndExports(node, exports);

    return exports;
}

module.exports = builder;
