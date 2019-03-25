import * as helpers from '../helpers'
import { AmmoType, IAmmoListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'
import throat from 'throat'

export function rustyWood(type: AmmoType): Promise<IAmmoListing[]> {
  const info: Info = {
    site: 'rustywood.ca',
    vendor: `Rusty Wood`,
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.goods',
    name: '.goods-item-title',
    img: '.goods-item-thumb',
    link: 'a',
    price: '.goods-price-single',

    nextPage: '.next',
  }
  const throttle = throat(1)

  const BASE = `https://www.${info.site}/shop`
  switch (type) {
    case AmmoType.centerfire:
    case AmmoType.rimfire:
      return Promise.all(
        ['factory', 'custom-loaded'].map(t =>
          throttle(() => scrape(p => `${BASE}/${t}/page/${p}`, info, selectors))
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classify(type))
    case AmmoType.shotgun:
      return Promise.resolve([])

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
