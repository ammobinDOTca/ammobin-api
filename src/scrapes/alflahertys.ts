import * as helpers from '../helpers'
import throat from 'throat'
import { AmmoType, IAmmoListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'

export function alflahertys(type: AmmoType): Promise<IAmmoListing[]> {
  const throttle = throat(1)

  const info: Info = {
    site: 'alflahertys.com',
    vendor: `Al Flaherty's`,
    provinces: [Province.ON],
  }

  const selectors: Selectors = {
    item: '.product .card',
    name: '.card-title',
    img: '.card-image',
    link: '.card-title a',
    price: '.price',

    nextPage: '.pagination-item--next',
    outOfStock: '.out-of-stock',
  }

  const BASE = 'https://alflahertys.com'
  switch (type) {
    case AmmoType.rimfire:
      return scrape(
        p =>
          `${BASE}/shooting-supplies-and-firearms/ammunition/rimfire-ammunition?page=${p}&setCurrencyId=1`,
        info,
        selectors
      ).then(items => helpers.classifyRimfire(items))

    case AmmoType.centerfire:
      return Promise.all(
        [
          'shooting-supplies-and-firearms/ammunition/bulk-centerfire',
          'centerfire-ammo',
        ].map(t =>
          throttle(() =>
            scrape(
              p => `${BASE}/${t}?page=${p}&setCurrencyId=1`,
              info,
              selectors
            )
          )
        )
      )
        .then(helpers.combineResults)
        .then(items => helpers.classifyCenterfire(items))

    case AmmoType.shotgun:
      return scrape(
        p =>
          `${BASE}/shooting-supplies-and-firearms/ammunition/shotgun-ammunition?page=${p}&setCurrencyId=1`,
        info,
        selectors
      ).then(items => helpers.classifyShotgun(items))

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
