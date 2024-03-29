import throat from 'throat'
import { scrape, Info, Selectors } from '../common'
import * as helpers from '../../helpers'
import { ItemType, IItemListing, Province } from '../../graphql-types'

export function northernEliteFirearms(type: ItemType): Promise<IItemListing[]|null> {
  const throttle = throat(1)
  const info: Info = {
    link: 'northernelitefirearms.ca',
    name: 'Northern Elite Firearms',
    provinces: [Province.SK],
  }

  const selectors: Selectors = {
    item: '.product',
    name: '.woocommerce-loop-product__title',
    img: 'img',
    link: 'a',
    price: '.price',
    nextPage: '.next',
    outOfStock: '.outofstock_label',
  }

  const BASE = 'https://www.northernelitefirearms.ca/product-category'
  switch (type) {
    case ItemType.rimfire:
      return scrape((p) => `${BASE}/ammunition-rim-fire/page/${p}`, info, selectors)

    case 'centerfire':
      return Promise.all(
        ['hand-guns', 'rifles', ''].map((t) =>
          throttle(() => scrape((p) => `${BASE}/ammunition-${t}/page/${p}`, info, selectors))
        )
      ).then(helpers.combineResults)

    case 'shotgun':
      return scrape((p) => `${BASE}/ammunition-shot-gun/page/${p}`, info, selectors)
    case ItemType.shot:
    case ItemType.primer:
    case ItemType.case:
    case ItemType.powder:
      return Promise.resolve(null) // 20190616 no reloading
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
