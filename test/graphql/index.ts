import axios from 'axios'
import { assert, USER_AGENT } from '../common'

function checkGetFlatListing(base) {
  const url =
    base +
    '/api/graphql?query=' +
    encodeURI(`{itemsFlatListings(itemType:centerfire subType: "9MM"){pages}}` + `&test_id=${Math.random()}`)
  return axios
    .get(url, { headers: { 'User-Agent': USER_AGENT } })
    .then((r) => assert(r.status === 200, `expected http 200 for GET ${url}, got ${r.status}`))
}

function checkGetVendors(base) {
  const url =
    base +
    '/api/graphql?query=%7Bvendors%7B+name+logo+link+background+%7D%7D&opName=vendors' +
    `&test_id=${Math.random()}`
  return axios
    .get(url, { headers: { 'User-Agent': USER_AGENT } })
    .then((r) => assert(r.status === 200, `expected http 200 for GET ${url}, got ${r.status}`))
}

export async function handler({ base }) {
  console.log('---graphql tests---')
  await checkGetVendors(base)
  console.log('  getVendors :+1:')
  await checkGetFlatListing(base)
  console.log('  checkGetFlatListing :+1:')
  return true
}
