import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'

import { NORDIC_MARKSMAN } from '../../vendors'

export function nordicMarksman(type: ItemType): Promise<IItemListing[]> {
  const info: Info = NORDIC_MARKSMAN

  const selectors: Selectors = {
    item: '.fp',
    name: '.fp-title',
    img: 'img',
    link: 'a',
    price: '.productprice',
    // nextPage: '.nav-links .next',
    // outOfStock: '.outofstock',
  }
  const work = (t) => scrape((p) => `https://www.${info.link}/${t}.html?perform=CatList&o=0&show=all`, info, selectors)

  switch (type) {
    case 'rimfire':
      return work('Ammunition')

    case 'centerfire':
      return work('Ammunition-Centerfire')
    case 'shotgun':
      return work('Ammunition-Shotshells')
    case ItemType.shot:
    case ItemType.primer:
    case ItemType.case:
    case ItemType.powder:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
