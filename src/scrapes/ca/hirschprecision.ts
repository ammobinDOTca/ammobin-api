import * as helpers from '../../helpers'

import { ItemType, IItemListing, Province } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'

export function hirsch(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    link: 'hirschprecision.com',
    name: `Hirsch Precision`,
    provinces: [Province.NS],
  }

  const selectors: Selectors = {
    item: '.productListing-odd, .productListing-even',
    name: '.itemTitle',
    img: '.listingProductImage',
    link: '.itemTitle a',
    price: '.price',

    // too lazy to figure out pagination
  }

  const BASE = `https://${info.link}`
  const fn = (s) => scrape(() => `${BASE}/index.php?main_page=index&cPath=${s}`, info, selectors)

  switch (type) {
    case ItemType.rimfire:
      return fn('98_105')
    case ItemType.shotgun:
      return Promise.resolve(null)
    case ItemType.centerfire:
      return fn('98_106')
    case ItemType.case:
      return fn('100_115')
    case ItemType.powder:
      return fn('100_122')
    case ItemType.shot:
      return fn('100_280')
    case ItemType.primer:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}

export function hirschss(type: ItemType): Promise<IItemListing[]> {
  function fn(ammotype) {
    return helpers.makeWrapApiReq('hirschprecision', ammotype).then((d) => d.items || [])
  }

  switch (type) {
    case ItemType.rimfire:
      return fn('98_105')
    case ItemType.shotgun:
      return Promise.resolve(null)
    case ItemType.centerfire:
      return fn('98_106')
    case ItemType.case:
      return fn('100_115')
    case ItemType.powder:
      return fn('100_122')
    case ItemType.shot:
      return fn('100_280')
    case ItemType.primer:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
