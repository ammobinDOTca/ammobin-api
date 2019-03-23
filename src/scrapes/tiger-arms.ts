import * as helpers from '../helpers'
import throat = require('throat')
import { Province, AmmoType, IAmmoListing } from '../graphql-types'

import { scrape, Info, Selectors } from './common'

export function tigerArms(type: AmmoType): Promise<IAmmoListing[]> {
  const throttle = throat(1)

  const info: Info = {
    site: 'tigerarms.ca',
    vendor: 'Tiger Arms',
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.product',
    name: '.desc h4',
    img: '.wp-post-image',
    link: 'a',
    price: '.amount',
    outOfStock: '.gema75_soldout_badge_new_2327',
  }
  const BASE = 'https://tigerarms.ca/product-category/ammunition'

  switch (type) {
    case AmmoType.rimfire:
      return scrape(
        p => `${BASE}/rimfire-ammo?paged=${p}`,
        info,
        selectors
      ).then(items => helpers.classifyBullets(items, type))

    case AmmoType.centerfire:
      return Promise.all(
        ['rifle-ammo', 'handgun-ammo'].map(s =>
          throttle(() =>
            scrape(p => `${BASE}/${s}?paged=${p}`, info, selectors)
          )
        )
      )
        .then(helpers.combineResults)
        .then(i => helpers.classifyBullets(i, type))

    case AmmoType.shotgun:
      return scrape(
        p => `${BASE}/shotgun-ammo?paged=${p}`,
        info,
        selectors
      ).then(items => helpers.classifyBullets(items, type))
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
