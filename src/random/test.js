
const test = require('../scrapes/cabelas-api')


test('shotgun').then(f => console.log(f)).catch(e => console.error('ERROR', e))

