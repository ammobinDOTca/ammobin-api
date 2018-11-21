const test = require('../scrapes/wanstalls')

test('centerfire')
  .then(f => console.log(f))
  .catch(e => console.error('ERROR', e))
