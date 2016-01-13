'use strict';

const planify = require('./');

planify({ reporter: 'progress' })
.step('Synchronous step', (data) => {
    console.log('A sync step in which data is', data);
    data.foz = 'baz';  // Set some data to the next step
})
.step('Callback step', (data, done) => {
    console.log('A callback step in which data is', data);
    setTimeout(done, 2000);
})
.step('Promise step', (data) => {
    console.log('A promise step in which data is', data);
    return new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
})
.phase('Some group of steps', (phase) => {
    phase.step('Synchronous step inside a phase', (data) => {
        console.log('A sync step inside a phase in which data is', data);
    });
})
.run({ foo: 'bar' });
