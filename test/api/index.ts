import axios from 'axios'
import { assert, USER_AGENT } from '../common'
import { ItemType } from '../../src/graphql-types'

function checkPing(base) {
  const url = base + '/api/ping' + `?test_id=${Math.random()}`
  return axios
    .get(url, { headers: { 'User-Agent': USER_AGENT } })
    .then((r) => assert(r.status === 200, `expected http 200 for GET ${url}, got ${r.status}`))
}

function checkTrackClick(base) {
  const url = base + '/api/track-click'
  return axios
    .post(
      url,
      {
        href: 'https://test-page',
        link: 'https://integ-test',
        itemType: ItemType.centerfire,
        subType: 'integ test',
        query: {},
      },
      { headers: { 'User-Agent': USER_AGENT } }
    )
    .then((r) => assert(r.status === 200, `expected http 200 for GET ${url}, got ${r.status}`))
}

function checkTrackView(base) {
  const url = base + '/api/track-pageview'
  return axios
    .post(
      url,
      {
        route: '/ping?integTests',
      },
      { headers: { 'User-Agent': USER_AGENT } }
    )
    .then((r) => assert(r.status === 200, `expected http 200 for GET ${url}, got ${r.status}`))
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
