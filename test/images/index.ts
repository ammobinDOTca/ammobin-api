import axios from 'axios'
import { USER_AGENT } from '../common'

/**
 * check that we can proxy an image
 */
function getImage(base: string) {
  return axios.get(base + '/images/x11/https://ammobin.ca/logos/dante-logo.png' + `?test_id=${Math.random()}`, {
    headers: { 'User-Agent': USER_AGENT },
  })
}

export async function handler({ base }) {
  console.log('---images---')
  await getImage(base)
  console.log('  getImage :+1:')
  return true
}
