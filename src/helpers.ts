import * as classifier from 'ammobin-classifier'
import { centerFireCalibres } from 'ammobin-classifier/build/centerfire-calibres'
import { rimfireCalibres } from 'ammobin-classifier/build/rimfire-calibres'
import { shotgunGauges } from 'ammobin-classifier/build/shotgun-gauges'
import axios from 'axios'
import moment from 'moment'
import { DATE_FORMAT } from './constants'
import { WRAPAPI_KEY } from './scrapes/ca/wrap-api-key'
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

  const defaultDelayMs = 5 // default to 5ms between requests (im paying by the 100ms with lambda. if they want me to slow down, then so be it)
  let delayMs = defaultDelayMs
  try {
    const robots = await axios.get(site + '/robots.txt').then((d) => d.data)

    const f = robots
      .split('\n')
      .map((l) => {
        return l.split(': ')
      })
      .find((l) => l[0].toLowerCase() === 'crawl-delay')

    if (f) {
      // check that actual number and between 0 and 1 min
      const parsed = parseInt(f[1], 10)
      if (parsed > 60) {
        // who and what is asking for this.... todo: log
      }
      delayMs = parsed >= 0 ? Math.min(parsed * 1000, 60000) : defaultDelayMs
    } else {
      console.debug('no Crawl-delay found for ' + site)
    }
  } catch (e) {
    console.error('ERROR ' + site, e && e.message ? e.message : e)
  }

  _siteToDelayMap[site] = delayMs

  return delayMs
}

/**
 * generate redis key for get/set scrape results in redis
 * @param source retailer website
 * @param type
 * @param subType
 */
export const getKey = (source: string, type: ItemType, subType: string) => {
  return `${moment.utc().format(DATE_FORMAT)}_${source}_${type}_${subType.split(' ').join('')}`.toLowerCase()
}

export function combineResults(results: (IItemListing[]|null)[]): IItemListing[] {
  return results.reduce((final, r) => (r ? final!.concat(r) : final), []) as any
}
export function classifyRimfire(items: IItemListing[]): IItemListing[] {
  return items.map((i) => {
    i.subType = classifier.classifyRimfire(i.subType || i.name || '').toUpperCase()
    return i
  })
}
export const classifyCenterfire = (items: IItemListing[]): IItemListing[] => {
  return items.map((i) => {
    i.subType = classifier.classifyCenterFire(i.subType || i.name || '').toUpperCase()
    return i
  })
}
export function classifyShotgun(items: IItemListing[]): IItemListing[] {
  return items.map((i) => {
    i.subType = classifier.classifyShotgun(i.subType || i.name || '').toUpperCase()
    return i
  })
}

export function classify(ammo: ItemType) {
  return (items: (IItemListing|null)[]) => classifyBullets(items, ammo)
}

export function classifyBullets(items: (IItemListing|null)[], ammo: ItemType): IItemListing[] {
  /**
   * classify all items of a certain type, then remove all those which where not classified
   */
  return (items as IItemListing[])
    .filter(i=>!!i)
    .map((i) => {
      const f = classifier.classifyAmmo(i.name || '')

      if (f.type === ammo) {
        i.subType = f.calibre.toUpperCase() || 'UNKNOWN'
      }

      return i
    })
    .filter((f) =>  f.subType)
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
  }).then((d) => {
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

export function itemTypeToStubTypes(itemType: ItemType): string[] {
  function ass() {
    switch (itemType) {
      case ItemType.centerfire:
        return centerFireCalibres
      case ItemType.shotgun:
        return shotgunGauges
      case ItemType.rimfire:
        return rimfireCalibres

      default:
        return [[itemType]]
    }
  }
  const cals = ass()
  if (!cals) {
    return [itemType]
  } else {
    return cals.map((i) => i[0])
  }
}

/**
 * what country are we running for?
 *ie: US CA
 */
export function getCountry() {
  if (process.env.COUNTRY) return process.env.COUNTRY
  else if (process.env.AWS_REGION) {
    const region = process.env.AWS_REGION
    if (region.startsWith('ca-')) return 'CA'
    else if (region.startsWith('us-')) return 'US'
  } else {
    throw new Error('cant get country')
  }
}
