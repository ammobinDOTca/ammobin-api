import axios from 'axios'
import { USER_AGENT } from '../common'

function checkGetFlatListing(base) {
  return axios.get(
    base +
      '/api/graphql?query=' +
      encodeURI(`{itemsFlatListings(itemType:centerfire subType: "9MM"){pages}}` + `&test_id=${Math.random()}`),
    { headers: { 'User-Agent': USER_AGENT } }
  )
}

function checkGetVendors(base) {
  return axios.get(
    base +
      '/api/graphql?query=%7Bvendors%7B+name+logo+link+background+%7D%7D&opName=vendors' +
      `&test_id=${Math.random()}`,
    { headers: { 'User-Agent': USER_AGENT } }
  )
}

export async function handler({ base }) {
  console.log('---graphql tests---')
  await checkGetVendors(base)
  console.log('  getVendors :+1:')
  await checkGetFlatListing(base)
  console.log('  checkGetFlatListing :+1:')
  return true
}
