'use strict';

const expect = require('chai').expect;
const fixtures = require('../fixtures');

it('should run scenarios/reporter-error, verifying if the reporter errors are handled correctly', () => {
    let reporter;

    // -------------------------------------
    // Plan
    // -------------------------------------
    reporter = {
        plan: {
            start() { throw new Error('Error at start'); },
        },
    };

    return fixtures.complexOk()
    .run({ reporter })
    .then(() => {
        throw new Error('Should have failed');
    }, (err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('Error at start');

        reporter = {
            plan: {
                finish() { throw new Error('Error at finish'); },
            },
        };

        return fixtures.complexOk()
        .run({ reporter });
    })
    .then(() => {
        throw new Error('Should have failed');
    }, (err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('Error at finish');
    })
    // -------------------------------------
    // Phase
    // -------------------------------------
    .then(() => {
        reporter = {
            phase: {
                start() { return Promise.reject(new Error('Error at phase start')); },
            },
        };

        return fixtures.complexOk()
        .run({ reporter });
    })
    .then(() => {
        throw new Error('Should have failed');
    }, (err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('Error at phase start');

        reporter = {
            phase: {
                ok(data, done) { done(new Error('Error at phase ok')); },
            },
        };

        return fixtures.complexOk()
        .run({ reporter });
    })
    .then(() => {
        throw new Error('Should have failed');
    }, (err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('Error at phase ok');
    })
    // -------------------------------------
    // Step
    // -------------------------------------
    .then(() => {
        reporter = {
            step: {
                start() { throw new Error('Error at step start'); },
            },
        };

        return fixtures.complexOk()
        .run({ reporter });
    })
    .then(() => {
        throw new Error('Should have failed');
    }, (err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('Error at step start');

        reporter = {
            step: {
                fail() { return Promise.reject(new Error('Error at step fail')); },
            },
        };

        return fixtures.complexOk()
        .run({ reporter });
    })
    .then(() => {
        throw new Error('Should have failed');
    }, (err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('Error at step fail');
    });
});

it('should run scenarios/reporter-error, verifying if the step errors are more important than reporter errors', () => {
    let reporterCalls = 0;
    let reporter;

    // -------------------------------------
    // Plan
    // -------------------------------------
    reporter = {
        plan: {
            fail() {
                reporterCalls += 1;
                throw new Error('Error at plan fail');
            },
        },
    };

    return fixtures.complexFail()
    .run({ reporter })
    .then(() => {
        throw new Error('Should have failed');
    }, (err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('Will NOT be ignored');
        expect(reporterCalls).to.equal(1);
    })
    // -------------------------------------
    // Phase
    // -------------------------------------
    .then(() => {
        reporterCalls = 0;
        reporter = {
            phase: {
                fail() {
                    reporterCalls += 1;
                    return Promise.reject(new Error('Error at phase fail'));
                },
            },
        };

        return fixtures.complexFail()
        .run({ reporter });
    })
    .then(() => {
        throw new Error('Should have failed');
    }, (err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('Will NOT be ignored');
        expect(reporterCalls).to.equal(2);
    })
    // -------------------------------------
    // Step
    // -------------------------------------
    .then(() => {
        reporterCalls = 0;
        reporter = {
            step: {
                fail(data, done) {
                    reporterCalls += 1;
                    done(new Error('Error at phase fail'));
                },
            },
        };

        return fixtures.complexFail()
        .run({ reporter })
        .then(() => {
            throw new Error('Should have failed');
        }, (err) => {
            expect(err).to.be.an.instanceOf(Error);
            expect(err.message).to.equal('Will NOT be ignored');
            expect(reporterCalls).to.equal(1);
        });
    });
});
