const test = require('../scrapes/soley-outdoors')

test('rimfire').then(f => console.log(f)).catch(e => console.error('ERROR', e.message))

