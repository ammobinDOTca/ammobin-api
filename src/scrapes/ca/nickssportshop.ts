//nickssportshop.ca
import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'
import * as helpers from '../../helpers'
import { NICKS_SPORTS } from '../../vendors'
import throat from 'throat'

export function nickssportshop(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)

  const info: Info = NICKS_SPORTS

  const selectors: Selectors = {
    item: '.product',
    name: '.woocommerce-loop-product__title',
    img: 'img',
    link: 'a',
    price: '.price',
    outOfStock: '.out-of-stock',
  }
  const work = (t) =>
    scrape((p) => `https://www.${info.link}/product-category/firearms-related/ammunition/${t}`, info, selectors)

  switch (type) {
    case 'rimfire':
      return work('rimfire-ammunition')

    case 'centerfire':
      Promise.all(
        ['centerfire-pistol-ammunition', 'centerfire-rifle-ammunition'].map((t) => throttle(() => work(t)))
      ).then(helpers.combineResults)
      return work('centerfire-pistol-ammunition')
    case 'shotgun':
      return work('shotgun-shells')
    case ItemType.shot:
    case ItemType.primer:
    case ItemType.case:
    case ItemType.powder:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
