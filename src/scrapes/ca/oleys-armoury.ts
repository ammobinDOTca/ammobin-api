import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'

import { OLEY } from '../../vendors'

export function oley(type: ItemType): Promise<IItemListing[]|null> {
  const info: Info = OLEY

  const selectors: Selectors = {
    item: '.product',
    name: '.card-title',
    img: 'img',
    link: '.card-title a',
    price: '.price--withoutTax',
   nextPage: '.pagination-item--next',
    // outOfStock: '.outofstock',
  }
  const work = (t) => scrape((p) => `https://www.${info.link}/${t}/?page=${p}`, info, selectors)

  switch (type) {
    case 'shotgun':
    case 'centerfire':
    case 'rimfire':
      return work('ammunition')
    case ItemType.shot:
    case ItemType.primer:
    case ItemType.case:
    case ItemType.powder:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
