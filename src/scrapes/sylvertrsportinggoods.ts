import * as helpers from '../helpers'
import throat from 'throat'
import { ItemType, IItemListing } from '../graphql-types'
import { scrape, Info, Selectors } from './common'
import { SYLVESTRE_SPORTING_GOODS } from '../vendors'

export function sylvertrsportinggoods(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)

  const info: Info = SYLVESTRE_SPORTING_GOODS

  const selectors: Selectors = {
    item: '.catalog-product',
    name: '.catalog-product-title',
    img: 'img',
    link: 'a',
    price: '.price-amount',

    // nextPage: '.pagination-item--next',
    outOfStock: '.soldout',
  }

  const BASE = 'https://' + info.link
  const work = path => scrape(p => `${BASE}/${path}/?pagesize=54`, info, selectors)
  switch (type) {
    case ItemType.rimfire:
      return work('rimfire-ammunition')
    case ItemType.centerfire:
      return Promise.all(['handgun-ammunition', 'rifle-ammunition'].map(t => throttle(() => work(t)))).then(
        helpers.combineResults
      )

    case ItemType.shotgun:
      return work('shotgun-ammunition')
    case ItemType.shot:
    case ItemType.case:
    case ItemType.powder:
    case ItemType.primer:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
