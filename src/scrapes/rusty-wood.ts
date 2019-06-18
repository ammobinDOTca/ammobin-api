import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'
import throat from 'throat'

export function rustyWood(type: ItemType): Promise<IItemListing[]> {
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
    case ItemType.centerfire:
    case ItemType.rimfire:
      return Promise.all(
        [
          'factory',
          'custom-loaded',
          'custom-loaded/page/2',
          'custom-loaded/page/3',
        ].map(t => throttle(() => scrape(p => `${BASE}/${t}`, info, selectors)))
      )
        .then(helpers.combineResults)
        .then(helpers.classify(type))
    case ItemType.shotgun:
    // 20190617: they have reloading but its single pages and hard to configure scrapes for. being lazy. todo: later
    case ItemType.case:
    case ItemType.shot:
    case ItemType.powder:
    case ItemType.primer:
      return Promise.resolve([])

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
