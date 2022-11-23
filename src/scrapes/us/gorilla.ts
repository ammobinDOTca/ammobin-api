import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'
import { GORILLA } from '../../vendors-us'

export function gorilla(type: ItemType): Promise<IItemListing[]|null> {
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
  const work = (t) =>
    scrape(
      (p) =>
        `https://www.${GORILLA.link}/shop/page/${p}/?product_cat=view-ammo-by-caliber&source_id=590&source_tax=product_cat&instock_filter=1`,
      GORILLA,
      selectors
    )
  switch (type) {
    case ItemType.rimfire:
    case ItemType.centerfire:
    case ItemType.shotgun:
      return work('')

    case ItemType.primer:
    case ItemType.case:
    case ItemType.shot:
    case ItemType.powder:
      return Promise.resolve(null)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
