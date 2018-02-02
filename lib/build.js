'use strict';

const promisify = require('./promisify');
const merge = require('lodash/assign');
const isPlainObject = require('lodash/isPlainObject');

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
    };

    const exports = {
        phase: createPhase.bind(null, node),
        step: createStep.bind(null, node),
        merge: mergeNodes.bind(null, node),
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
        mute: { stdout: false, stderr: false },
        fatal: true,
        slow: 200,
    }, options);

    if (!isPlainObject(options.mute)) {
        options.mute = { stdout: !!options.mute, stderr: !!options.mute };
    }

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
    planNode.steps.push(node);

    return parentNode.exports;
}

function mergeNodes(targetNode, srcPlanExports) {
    const targetPlanNode = targetNode.plan || targetNode;
    const srcPlan = srcPlanExports.node;

    if (srcPlan.type !== 'plan') {
        throw new Error('Can only merge a plan');
    }

    const iterateSrcDescendants = (node, depth) => {
        node.plan = targetPlanNode;
        node.depth = depth;
        node.children && node.children.forEach((node) => iterateSrcDescendants(node, depth + 1));

        if (node.type === 'step') {
            targetPlanNode.steps.push(node);
        }
    };

    // Move the src children to target
    srcPlan.children.forEach((srcChildNode) => {
        // Add this src child to the target children
        targetNode.children.push(srcChildNode);

        // Update child parent node
        srcChildNode.parent = targetNode;

        // Iterate over src descendants to perform additional operations
        iterateSrcDescendants(srcChildNode, targetNode.depth + 1);
    });

    // Shallow copy the src plan data to target plan data
    Object.assign(targetPlanNode.data, srcPlan.data);

    // Reset src children
    srcPlan.children = [];
}

function builder(data) {
    const node = {
        depth: -1,
        type: 'plan',
        label: 'Plan',
        children: [],
        steps: [],
        data: data || {},
    };

    const exports = {
        phase: createPhase.bind(null, node),
        step: createStep.bind(null, node),
        merge: mergeNodes.bind(null, node),
    };

    linkNodeAndExports(node, exports);

    return exports;
}

module.exports = builder;
