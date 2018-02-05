const test = require('../scrapes/durhamoutdoors')

test('centerfire').then(f => console.log(f)).catch(e => console.error('ERROR', e.message))

