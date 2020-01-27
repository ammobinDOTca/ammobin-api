import axios from 'axios'
import { USER_AGENT } from '../common'
import { ItemType } from '../../src/graphql-types'

function checkPing(base) {
  return axios.get(base + '/api/ping' + `?test_id=${Math.random()}`, { headers: { 'User-Agent': USER_AGENT } })
}

function checkTrackClick(base) {
  return axios.post(
    base + '/api/track-click',
    {
      href: 'https://test-page',
      link: 'https://sail.ca/INTEG-TEST',
      itemType: ItemType.centerfire,
      subType: 'integ test',
      query: {},
    },
    { headers: { 'User-Agent': USER_AGENT } }
  )
}

function checkTrackView(base) {
  return axios.post(
    base + '/api/track-pageview',
    {
      route: '/ping?integTests',
    },
    { headers: { 'User-Agent': USER_AGENT } }
  )
}

export async function handler({ base }) {
  console.log('---api---')
  await checkPing(base)
  console.log('  ping :+1:')
  await checkTrackClick(base)
  console.log('  trackClick :+1:')
  await checkTrackView(base)
  console.log('  trackView :+1:')
}
