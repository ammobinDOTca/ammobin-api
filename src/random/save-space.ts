import * as zlib from 'zlib'

const input = [{ aa: 'foo' }]

const en = zlib.gzipSync(JSON.stringify(input)).toString('base64')
console.log(en)
const de = JSON.parse(zlib.gunzipSync(Buffer.from(en, 'base64')).toString())

console.log(input, de)
