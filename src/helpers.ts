import * as classifier from 'ammobin-classifier'
import axios from 'axios'
import moment from 'moment'
import { DATE_FORMAT } from './constants'
import { WRAPAPI_KEY } from './scrapes/wrap-api-key'
import delay from 'delay'

// in memory cache of site to delay so as to not spam robots.txt
const _siteToDelayMap = {}

/**
 * get the crawl delay from robots.txt
 * @param {string} site base url
 * @returns {Promise<number>}
 */
export async function getCrawlDelayMS(site: string) {
  if (_siteToDelayMap[site] >= 0) {
    return _siteToDelayMap[site]
  }

  let delay = 1000 // default to 1s between requests
  try {
    const robots = await axios.get(site + '/robots.txt').then(d => d.data)

    const f = robots
      .split('\n')
      .map(l => {
        return l.split(': ')
      })
      .find(l => l[0].toLowerCase() === 'crawl-delay')

    if (f) {
      delay = Math.min(parseInt(f[1], 10) * 1000, 10000) // up to 10s
    } else {
      console.debug('no Crawl-delay found for ' + site)
    }
  } catch (e) {
    console.error('ERROR ' + site, e && e.message ? e.message : e)
  }

  _siteToDelayMap[site] = delay

  return delay
}

export const getKey = (source, type) => {
  return `${moment.utc().format(DATE_FORMAT)}_${source}_${type}`
}

export function combineResults(results: any[]) {
  return results.reduce((final, r) => (r ? final.concat(r) : final), [])
}
export function classifyRimfire(items: any[]) {
  return items.map(i => {
    i.calibre = classifier
      .classifyRimfire(i.calibre || i.name || '')
      .toUpperCase()
    return i
  })
}
export const classifyCenterfire = items => {
  return items.map(i => {
    i.calibre = classifier
      .classifyCenterFire(i.calibre || i.name || '')
      .toUpperCase()
    return i
  })
}
export function classifyShotgun(items) {
  return items.map(i => {
    i.calibre = classifier
      .classifyShotgun(i.calibre || i.name || '')
      .toUpperCase()
    return i
  })
}

export function classifyBullets(items, ammo) {
  /**
   * classify all items of a certain type, then remove all those which where not classified
   */
  return items
    .map(i => {
      const f = classifier.classifyAmmo(i.name || '')

      if (f.type === ammo) {
        i.calibre = f.calibre.toUpperCase()
      }

      return i
    })
    .filter(f => f.calibre)
}
export function makeWrapApiReq(target, ammotype, page = 1) {
  return axios({
    url: `https://wrapapi.com/use/meta-ammo-ca/${target}/${target}/latest`,
    method: 'post',
    data: {
      ammotype,
      page,
      wrapAPIKey: WRAPAPI_KEY,
    },
  }).then(d => {
    if (!d.data.data) {
      // console.log(d.data)
      throw new Error(
        `failed to load list of items for ${target} ${ammotype}: ${
          d.data.messages && d.data.messages.length ? d.data.messages[0] : ''
        }`
      )
    }

    return d.data.data
  })
}

export async function delayScrape(site) {
  const ms = await getCrawlDelayMS(site)
  return delay(ms)
}
