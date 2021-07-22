import { VICTORY_RIDGE_SPORTS } from '../../vendors'
import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'

function work(path: String = 'shop/category/ammunition') {
  const selectors: Selectors = {
    item: '.product',
    name: '.product-title',
    img: 'img',
    link: 'a',
    price: '.price',
    nextPage: '.page-next',
    outOfStock: '.fusion-out-of-stock',
  }

  return scrape(
    (p) => `https://${VICTORY_RIDGE_SPORTS.link}/${path}/page/${p}/?product_count=48`,
    VICTORY_RIDGE_SPORTS,
    selectors
  )
}

export function victoryRidge(type: ItemType): Promise<IItemListing[]> {
  switch (type) {
    case ItemType.rimfire:
    case ItemType.shotgun:
    case ItemType.centerfire:
      return work()
    case ItemType.case:
    case ItemType.powder:
    case ItemType.shot:
    case ItemType.primer:
      return Promise.resolve(null)
    default:
      throw new Error('Unknown type: ' + type)
  }
}
