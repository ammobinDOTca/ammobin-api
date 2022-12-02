import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'
import { GORILLA } from '../../vendors-us'
import { combineResults } from '../../helpers'
import throat from 'throat'

export function gorilla(type: ItemType): Promise<IItemListing[] | null> {
  // todo - break out more info

  const selectors: Selectors = {
    item: '.product',
    name: '.woocommerce-loop-product__title',
    img: 'img',
    link: 'a',
    price: '.price .amount', // they also have a low price
    nextPage: '.next', // todo
    // outOfStock: '.card-bulkOrder-action [data-event-type="product-click"]', // handled by url
  }
  //
  const throttle = throat(1)

  const work = (t) =>
    scrape(
      (p) =>
        `https://www.${GORILLA.link}/product-category/${t}/page/${p}`,
      GORILLA,
      selectors
    )
  switch (type) {
    case ItemType.centerfire:
      return Promise.all(['gorilla-hunt-ammunition', 'gorilla-defense', 'gorilla-pistol-ammo', 'gorilla-subsonic', 'gorilla-target'].map(t => throttle(() => work(t)))).then(combineResults)

    case ItemType.shotgun:
    case ItemType.rimfire:
    case ItemType.primer:
    case ItemType.case:
    case ItemType.shot:
    case ItemType.powder:
      return Promise.resolve(null)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
