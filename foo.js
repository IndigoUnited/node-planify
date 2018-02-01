'use strict';

const planify = require('.');


const plan1 = planify({ foo: 'foo' })
.step('Some cool step 1', (data) => {
    console.log(data);
});

const plan2 = planify({ bar: 'bar' })
.step('Some cool step 2', (data) => {
    console.log('!!!!');
    console.log(data);
});

plan1.merge(plan2);

plan1
.run({ exit: true })
.then(() => process.exit(0), () => process.exit(1));
