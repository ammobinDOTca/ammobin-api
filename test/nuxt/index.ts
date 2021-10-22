import axios from 'axios'
import { assert, USER_AGENT } from '../common'

function checkIndex(base) {
  const url = base + '/' + `?test_id=${Math.random()}`
  return axios
    .get(url, { headers: { 'User-Agent': USER_AGENT } })
    .then((r) => assert(r.status === 200, `expected http 200 for GET ${url}, got ${r.status}`))
}

function checkItemPage(base) {
  const url = base + '/en/centerfire/9MM' + `?test_id=${Math.random()}`
  return axios
    .get(url, { headers: { 'User-Agent': USER_AGENT } })
    .then((r) => assert(r.status === 200, `expected http 200 for GET ${url}, got ${r.status}`))
}

function checkFrench(base) {
  const url = base + '/fr/rimfire/22LR' + `?test_id=${Math.random()}`
  return axios
    .get(url, { headers: { 'User-Agent': USER_AGENT } })
    .then((r) => assert(r.status === 200, `expected http 200 for GET ${url}, got ${r.status}`))
}

export async function handler({ base }: { base: string }) {
  console.log('---nuxt---')
  await checkIndex(base)
  console.log('  index :+1:')

  await checkItemPage(base)
  console.log('  checkItemPage :+1:')

  if (base.includes('.ca')) {
    await checkFrench(base)
    console.log('  checkFrench :+1:')
  }
}
