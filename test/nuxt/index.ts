import axios from 'axios'
import { assert, USER_AGENT } from '../common'

function checkIndex(base) {
  const url = base + '/' + `?test_id=${Math.random()}`
  return axios
    .get(url, { headers: { 'User-Agent': USER_AGENT } })
    .then((r) => assert(r.status === 200, `expected http 200 for GET ${url}, got ${r.status}`))
}

export async function handler({ base }) {
  console.log('---nuxt---')
  await checkIndex(base)
  console.log('  index :+1:')
}
