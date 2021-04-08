import { ItemType, IItemListing, Province } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'

export function alSimmons(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    link: 'alsimmonsgunshop.com',
    name: `Al Simmons`,
    provinces: [Province.ON],
  }

  const selectors: Selectors = {
    item: '.product',
    name: '.woocommerce-loop-product__title',
    img: 'img',
    link: 'a',
    price: '.price',
    nextPage: '.next',
    outOfStock: '.out-of-stock',
  }
  // todo: [itemprop='description'] -> item count
  switch (type) {
    case ItemType.rimfire:
    case ItemType.centerfire:
    case ItemType.shotgun:
      return scrape(
        (p) => `https://${info.link}/product-category/ammunition/page/${p}/?product_count=100`,
        info,
        selectors
      )

    case ItemType.shot:
    case ItemType.case:
    case ItemType.powder:
    case ItemType.primer:
      return Promise.resolve(null) // no reloading 20190635
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
