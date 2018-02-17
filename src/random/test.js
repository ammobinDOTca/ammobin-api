const test = require('../scrapes/northpro')

test('rimfire').then(f => console.log(f)).catch(e => console.error('ERROR', e.message))

