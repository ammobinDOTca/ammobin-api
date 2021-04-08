import throat from 'throat'
import { scrape, Info, Selectors } from '../common'
import * as helpers from '../../helpers'
import { ItemType, IItemListing, Province } from '../../graphql-types'

export function vancouvergunstore(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info: Info = {
    link: 'vancouvergunstore.ca',
    name: 'Vancouver Gun Store',
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.product-inner',
    name: '.woocommerce-loop-product__title',
    img: '.attachment-woocommerce_thumbnail',
    link: '.woocommerce-LoopProduct-link',
    price: '.woocommerce-Price-amount',
    nextPage: '.next',
  }

  const BASE = `https://${info.link}/product-category/`
  switch (type) {
    case ItemType.rimfire:
      return scrape((p) => `${BASE}/ammunition/rimfire?paged=${p}`, info, selectors)
    case 'centerfire':
      return Promise.all(
        ['pistol', 'rifle', 'bulk'].map((t) =>
          throttle(() => scrape((p) => `${BASE}/ammunition/${t}?paged=${p}`, info, selectors))
        )
      ).then(helpers.combineResults)

    case 'shotgun':
      return scrape((p) => `${BASE}/ammunition/shotgun-ammunition?paged=${p}`, info, selectors)
    case ItemType.case:
      return scrape((p) => `${BASE}/reloading-supplies/brass?paged=${p}`, info, selectors)
    case ItemType.shot:
      return scrape((p) => `${BASE}/reloading-supplies/bullets?paged=${p}`, info, selectors)
    case ItemType.primer:
      return scrape((p) => `${BASE}/reloading-supplies/primers?paged=${p}`, info, selectors)
    case ItemType.powder:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
