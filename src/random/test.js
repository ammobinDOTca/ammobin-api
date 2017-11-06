const test = require('../scrapes/al-simmons')

test('centerfire').then(res => console.log(res)).catch(e => console.error('ERROR', e))

