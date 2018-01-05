const test = require('../scrapes/lanz')

test('rimfire').then(f => console.log(f)).catch(e => console.error('ERROR', e.message))

