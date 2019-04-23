import * as classifier from 'ammobin-classifier'
import axios from 'axios'
import moment from 'moment'
import { DATE_FORMAT } from './constants'
import { WRAPAPI_KEY } from './scrapes/wrap-api-key'
import delay from 'delay'
import { ItemType, IItemListing } from './graphql-types'
// in memory cache of site to delay so as to not spam robots.txt
const _siteToDelayMap = {}

/**
 * get the crawl delay from robots.txt
 * @param {string} site base url
 * @returns {Promise<number>}
 */
export async function getCrawlDelayMS(site: string): Promise<number> {
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

export const getKey = (source: string, type: ItemType) => {
  return `${moment.utc().format(DATE_FORMAT)}_${source}_${type}`
}

export function combineResults(results: IItemListing[][]): IItemListing[] {
  return results.reduce((final, r) => (r ? final.concat(r) : final), [])
}
export function classifyRimfire(items: IItemListing[]): IItemListing[] {
  return items.map(i => {
    i.calibre = classifier
      .classifyRimfire(i.calibre || i.name || '')
      .toUpperCase()
    return i
  })
}
export const classifyCenterfire = (items: IItemListing[]): IItemListing[] => {
  return items.map(i => {
    i.calibre = classifier
      .classifyCenterFire(i.calibre || i.name || '')
      .toUpperCase()
    return i
  })
}
export function classifyShotgun(items: IItemListing[]): IItemListing[] {
  return items.map(i => {
    i.calibre = classifier
      .classifyShotgun(i.calibre || i.name || '')
      .toUpperCase()
    return i
  })
}

export function classify(ammo: ItemType) {
  return (items: IItemListing[]) => classifyBullets(items, ammo)
}

export function classifyBullets(
  items: IItemListing[],
  ammo: ItemType
): IItemListing[] {
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
export function makeWrapApiReq(
  target: string,
  ammotype: string,
  page = 1
): Promise<{ page: number; lastPage: number; items: IItemListing[] }> {
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

export async function delayScrape(site: string) {
  const ms = await getCrawlDelayMS(site)
  return delay(ms)
}
