'use strict';

const expect = require('chai').expect;
const Promise = require('bluebird');
const planify = require('../');
const bufferStdio = require('./helpers/buffer-stdio');

describe('functional', () => {
    describe('.getNode()', () => {
        it('should return the plan node (root node)', () => {
            const node = planify().getNode();

            expect(node).to.be.an('object');
            expect(node.type).to.equal('plan');
        });
    });

    describe('.phase()', () => {
        it('should be able to create phases', () => {
            const plan = planify();

            plan.phase('phase label', (phase) => {
                expect(phase).to.have.all.keys('phase', 'step');
            });

            const node = plan.getNode();

            expect(node.children).to.have.length(1);
            expect(node.children[0].type).to.equal('phase');
            expect(node.children[0].label).to.equal('phase label');
        });

        it('should allow chaining', () => {
            const plan = planify();
            const ret = plan.phase('phase label', (phase) => {
                const ret = phase.phase('phase of phase label', () => {});

                expect(ret).to.equal(phase);
            });

            expect(ret).to.equal(plan);
        });
    });

    describe('.step()', () => {
        it('should be able to create steps', () => {
            const plan = planify();

            plan.step('step label', () => {});
            plan.phase('phase label', (phase) => {
                phase.step('phase step label', () => {});
            });

            const node = plan.getNode();

            expect(node.children).to.have.length(2);
            expect(node.children[0].type).to.equal('step');
            expect(node.children[0].label).to.equal('step label');
            expect(node.children[1].type).to.equal('phase');
            expect(node.children[1].label).to.equal('phase label');
            expect(node.children[1].children).to.have.length(1);
            expect(node.children[1].children[0].type).to.equal('step');
            expect(node.children[1].children[0].label).to.equal('phase step label');

            expect(node.steps).to.have.length(2);
            expect(node.steps[0]).to.equal(node.children[0]);
            expect(node.steps[1]).to.equal(node.children[1].children[0]);
        });

        it('should set the step options', () => {
            const plan = planify();

            plan.step('step label', { mute: true, slow: 10000 }, () => {});

            const step = plan.getNode().children[0];

            expect(step.type).to.equal('step');
            expect(step.options.mute).to.eql({ stdout: true, stderr: true });
            expect(step.options.slow).to.equal(10000);
        });

        it('should allow chaining', () => {
            const plan = planify();
            const ret = plan.step('step label', () => {});

            expect(ret).to.equal(plan);
        });
    });

    describe('.run()', () => {
        it('should successfully run a simple plan', () => {
            return planify()
            .step('step 1', (data) => {
                data.step1 = 'foo';
            })
            .step('step 2', (data, done) => {
                data.step2 = 'foo';
                setTimeout(done, 50);
            })
            .step('step 3', (data) => {
                return Promise.delay(50)
                .then(() => { data.step3 = 'foo'; });
            })
            .run({ reporter: 'silent' })
            .then((data) => {
                expect(data).to.eql({
                    step1: 'foo',
                    step2: 'foo',
                    step3: 'foo',
                });
            });
        });

        it('should fail if one of the steps failed', () => {
            return planify()
            .step('step 1', () => { throw new Error('foo'); })
            .run({ reporter: 'silent' })
            .then(() => {
                throw new Error('Should have failed');
            }, (err) => {
                expect(err).to.be.an.instanceOf(Error);
                expect(err.message).to.equal('foo');
            })
            .then(() => {
                return planify()
                .step('step 1', (data, done) => done(new Error('foo')))
                .run({ reporter: 'silent' });
            })
            .then(() => {
                throw new Error('Should have failed');
            }, (err) => {
                expect(err).to.be.an.instanceOf(Error);
                expect(err.message).to.equal('foo');
            })
            .then(() => {
                return planify()
                .step('step 1', () => Promise.reject(new Error('foo')))
                .run({ reporter: 'silent' });
            })
            .then(() => {
                throw new Error('Should have failed');
            }, (err) => {
                expect(err).to.be.an.instanceOf(Error);
                expect(err.message).to.equal('foo');
            });
        });

        it('should accept callbacks', (next) => {
            planify()
            .step('step 1', () => {})
            .run({ reporter: 'silent' }, (err) => {
                expect(err).to.not.be.ok;
                next();
            });
        });

        it('should fail if trying to run plan while already running', () => {
            const plan = planify()
            .step('step 1', () => Promise.delay(100));

            const promise = plan.run({ reporter: 'silent' });

            expect(() => plan.run({ reporter: 'silent' })).to.throw('A plan is already running');

            return promise;
        });

        it('should fail if trying to run two plans simultaneously', () => {
            const promise = planify()
            .step('step 1', () => {
                return Promise.delay(100);
            })
            .run({ reporter: 'silent' });

            expect(() => {
                planify()
                .step('step 1', () => {})
                .run({ reporter: 'silent' });
            }).to.throw('A plan is already running');

            return promise;
        });

        it('should not allow any more phases or steps to be added if running', () => {
            let asserts = 0;
            let deepPhase;

            const plan = planify()
            .step('step 1', () => {
                return Promise.delay(50);
            })
            .phase('phase 1', (phase) => {
                deepPhase = phase;
            });

            const promise = plan.run({ reporter: 'silent' });

            setImmediate(() => {
                expect(() => {
                    asserts += 1;
                    plan.step('step 2', () => {});
                }).to.throw('Can\'t modify plan when is already running');
            });

            setImmediate(() => {
                expect(() => {
                    asserts += 1;
                    plan.phase('phase 1', () => {});
                }).to.throw('Can\'t modify plan when is already running');
            });

            setImmediate(() => {
                expect(() => {
                    asserts += 1;
                    deepPhase.step('phase 1 step 1', () => {});
                }).to.throw('Can\'t modify plan when is already running');
            });

            setImmediate(() => {
                expect(() => {
                    asserts += 1;
                    deepPhase.phase('phase 1 phase 1', () => {});
                }).to.throw('Can\'t modify plan when is already running');
            });

            return promise
            .then(() => {
                expect(asserts).to.equal(4);
            });
        });

        it('should run the plan with the specified initial data and resolve with it', () => {
            const initialData = { foo: 'bar' };
            let stepData;

            return planify(initialData)
            .step('step 1', (data) => { stepData = data; })
            .run({ reporter: 'silent' })
            .then((finalData) => {
                expect(finalData).to.equal(initialData);
                expect(stepData).to.equal(initialData);
            });
        });
    });

    describe('options', () => {
        it('should use the options.reporter as an object', () => {
            let ok = false;
            const reporter = {
                plan: {
                    start: () => { ok = true; },
                },
            };

            return planify()
            .step('step 1', () => {})
            .run({ reporter })
            .then(() => {
                expect(ok).to.equal(true);
            });
        });

        it.skip('should use the options.reporter as a string');

        it('should throw an appropriate error if options.reporter does not exist', () => {
            expect(() => {
                planify()
                .run({ reporter: 'somethingthatwillneverexist' });
            }).to.throw('Unknown reporter: somethingthatwillneverexist');
        });

        it('should throw an appropriate error if options.reporter is not a plain object', () => {
            function Foo() {}

            expect(() => {
                planify()
                .run({ reporter: new Foo() });
            }).to.throw('Reporter must be a string or a plain object');
        });

        it('should exit automatically with an appropriate exit code if options.exit is set to true', () => {
            const exitCodes = [];
            const originalExit = process.exit;

            process.exit = (code) => { exitCodes.push(code); };

            return planify()
            .step('step 1', () => {})
            .run({ reporter: 'silent', exit: true })
            .then(() => {
                return planify()
                .step('step 1', () => { throw new Error('foo'); })
                .run({ reporter: 'silent', exit: true });
            })
            .catch(() => {
                return planify()
                .step('step 1', () => {
                    const err = new Error('foo');

                    err.exitCode = 25;
                    throw err;
                })
                .run({ reporter: 'silent', exit: true });
            })
            .then(() => {
                throw new Error('Should have failed');
            }, (err) => {
                expect(err.message).to.eql('foo');
                expect(exitCodes).to.eql([0, 1, 25]);
            })
            .finally(() => {
                process.exit = originalExit;
            });
        });
    });

    describe('step options', () => {
        it('should keep running if options.fatal is false', () => {
            let stepError;
            const reporter = {
                step: {
                    fail(step, err) { stepError = err; },
                },
            };

            return planify()
            .step('step 1', { fatal: false }, () => { throw new Error('foo'); })
            .step('step 2', (data) => { data.step2 = 'foo'; })
            .run({ reporter })
            .then((data) => {
                expect(stepError).to.be.an.instanceOf(Error);
                expect(stepError.message).to.equal('foo');
                expect(data).to.eql({ step2: 'foo' });
            });
        });

        it('should calculate the speed correctly based on options.slow', () => {
            const speeds = [];
            const reporter = {
                step: {
                    finish(step) { speeds.push(step.info.speed); },
                },
            };

            return planify()
            .step('step 1', { slow: 100 }, () => { return Promise.delay(101); })
            .step('step 3', { slow: 500 }, () => { return Promise.delay(251); })
            .step('step 4', { slow: 500 }, () => { return Promise.delay(10); })
            .run({ reporter })
            .then(() => {
                expect(speeds).to.eql(['slow', 'medium', 'fast']);
            });
        });

        describe('options.mute', () => {
            function testMuteOption(options) {
                const called = { stdout: false, stderr: false };
                const reporter = {
                    step: {
                        write: {
                            stdout() { called.stdout = true; },
                            stderr() { called.stderr = true; },
                        },
                    },
                };

                bufferStdio.start();

                return planify()
                .step('step 1', options, () => {
                    console.log('write to stdout');
                    console.error('write to stderr');
                    process.stdout.write('write to stdout\n');
                    process.stderr.write('write to stderr\n');
                })
                .run({ reporter })
                .finally(() => {
                    const buffered = bufferStdio.finish();

                    expect(buffered.stdout).to.equal('');
                    expect(buffered.stderr).to.equal('');
                })
                .return(called);
            }

            it('should mute stdout & stderr if both are set to true', () => {
                return testMuteOption({ mute: true })
                .then((called) => {
                    expect(called).to.eql({ stdout: false, stderr: false });

                    return testMuteOption({ mute: { stdout: true, stderr: true } });
                })
                .then((called) => {
                    expect(called).to.eql({ stdout: false, stderr: false });
                });
            });

            it('should NOT mute stdout & stderr if both are set to falsy', () => {
                return testMuteOption({ mute: false })
                .then((called) => {
                    expect(called).to.eql({ stdout: true, stderr: true });

                    return testMuteOption({ mute: null });
                })
                .then((called) => {
                    expect(called).to.eql({ stdout: true, stderr: true });

                    return testMuteOption({ mute: { stdout: null, stderr: undefined } });
                })
                .then((called) => {
                    expect(called).to.eql({ stdout: true, stderr: true });

                    return testMuteOption({ mute: { stdout: null, stderr: undefined } });
                })
                .then((called) => {
                    expect(called).to.eql({ stdout: true, stderr: true });

                    return testMuteOption();
                })
                .then((called) => {
                    expect(called).to.eql({ stdout: true, stderr: true });
                });
            });

            it('should only mute stdout if only options.mute.stdout is true', () => {
                return testMuteOption({ mute: { stdout: true, stderr: false } })
                .then((called) => {
                    expect(called).to.eql({ stdout: false, stderr: true });

                    return testMuteOption({ mute: { stdout: true, stderr: null } });
                })
                .then((called) => {
                    expect(called).to.eql({ stdout: false, stderr: true });
                });
            });

            it('should only mute stderr if only options.mute.stderr is true', () => {
                return testMuteOption({ mute: { stdout: false, stderr: true } })
                .then((called) => {
                    expect(called).to.eql({ stdout: true, stderr: false });

                    return testMuteOption({ mute: { stdout: null, stderr: true } });
                })
                .then((called) => {
                    expect(called).to.eql({ stdout: true, stderr: false });
                });
            });
        });
    });

    describe('stdio hook', () => {
        it('should hook stdout & stderr and forward it to the reporter', () => {
            const output = { stdout: '', stderr: '' };
            const reporter = {
                step: {
                    write: {
                        stdout(step, str) { output.stdout += str; },
                        stderr(step, str) { output.stderr += str; },
                    },
                },
            };

            return planify()
            .step('step 1', () => {
                console.log('write to stdout');
                process.stdout.write('another write to stdout\n');

                console.error('write to stderr');
                process.stderr.write('another write to stderr\n');
            })
            .run({ reporter })
            .then(() => {
                expect(output).to.eql({
                    stdout: 'write to stdout\nanother write to stdout\n',
                    stderr: 'write to stderr\nanother write to stderr\n',
                });
            });
        });

        it('should unhook stdio on uncaught exceptions', (next) => {
            const listeners = process.listeners('uncaughtException');
            const mochaListener = listeners[listeners.length - 1];
            let uncaughtException;

            // Remove mocha listener & track uncaught exception
            process.removeListener('uncaughtException', mochaListener);
            process.once('uncaughtException', (err) => { uncaughtException = err; });

            planify()
            .step('step 1', () => {
                setTimeout(() => {
                    process.nextTick(() => {
                        // Restore listeners exactly how they were, including order
                        process.removeAllListeners('uncaughtException');
                        listeners.forEach((listener) => process.on('uncaughtException', listener));

                        expect(uncaughtException).to.be.an.instanceOf(Error);
                        expect(uncaughtException.message).to.equal('foo');

                        setTimeout(next, 50);
                    });

                    throw new Error('foo');
                }, 25);

                return Promise.delay(50);
            })
            .run({ reporter: 'silent' });
        });

        it('should work well with buffers', () => {
            const output = { stdout: '', stderr: '' };
            const reporter = {
                step: {
                    write: {
                        stdout(step, buffer) {
                            expect(buffer).to.be.an.instanceOf(Buffer);
                            output.stdout += buffer;
                        },
                        stderr(step, buffer) {
                            expect(buffer).to.be.an.instanceOf(Buffer);
                            output.stderr += buffer;
                        },
                    },
                },
            };

            return planify()
            .step('step 1', () => {
                process.stdout.write(new Buffer('write to stdout\n'));
                process.stderr.write(new Buffer('write to stderr\n'));
            })
            .run({ reporter })
            .then(() => {
                expect(output).to.eql({
                    stdout: 'write to stdout\n',
                    stderr: 'write to stderr\n',
                });
            });
        });
    });
});
