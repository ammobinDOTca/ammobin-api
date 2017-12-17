const test = require('../scrapes/shooting-edge')

test('centerfire').then(f => console.log(f.length)).catch(e => console.error('ERROR', e))

