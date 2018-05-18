const test = require('../scrapes/wild-west')

test('centerfire').then(f => console.log(f)).catch(e => console.error('ERROR', e.message))

