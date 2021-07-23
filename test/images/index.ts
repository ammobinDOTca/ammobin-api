import axios from 'axios'
import { assert, USER_AGENT } from '../common'

/**
 * check that we can proxy an image
 */
function getImage(base: string) {
  const url = base + '/images/x11/https://ammobin.ca/logos/dante-logo.png' + `?test_id=${Math.random()}`
  return axios
    .get(url, { headers: { 'User-Agent': USER_AGENT } })
    .then((r) => assert(r.status === 200, `expected http 404 for GET ${url}, got ${r.status}`))
}

export async function handler({ base }) {
  console.log('---images---')
  await getImage(base)
  console.log('  getImage :+1:')
  return true
}
