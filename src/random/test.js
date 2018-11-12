const test = require('../scrapes/gothic-line-armoury')

test('centerfire')
  .then(f => console.log(f))
  .catch(e => console.error('ERROR', e))
