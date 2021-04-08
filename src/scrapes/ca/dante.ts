import { scrape, Info, Selectors } from '../common'

import { Province, ItemType, IItemListing } from '../../graphql-types'
function work(type: String): Promise<IItemListing[]> {
  const info: Info = {
    link: 'dantesports.com',
    name: `Dante Sports`,
    provinces: [Province.QC],
  }

  const selectors: Selectors = {
    item: '.product',
    name: '.woocommerce-loop-product__title',
    img: '.wp-post-image',
    link: '.woocommerce-LoopProduct-link',
    price: '.woocommerce-Price-amount',

    //nextPage: '.next',
    outOfStock: '.outofstock',
  }

  return scrape((_) => `https://www.${info.link}/en/product-category/shop/${type}/?product_count=100`, info, selectors)
}
export function dante(type: ItemType): Promise<IItemListing[]> {
  switch (type) {
    case ItemType.rimfire:
      return work('ammunition/rimfire')

    case ItemType.centerfire:
      return work('ammunition/centerfire')

    case ItemType.shotgun:
      return work('ammunition/shotshells')
    case ItemType.shot:
      return work('reloading/campro')
    case ItemType.powder:
    case ItemType.case:
    case ItemType.primer:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
