import { VICTORY_RIDGE_SPORTS } from '../../vendors'
import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'

function work(path: String = 'shop/category/ammunition') {
  const selectors: Selectors = {
    item: '.product',
    name: '.wd-entities-title',
    img: 'img',
    link: 'a',
    price: '.price',
    nextPage: '.next',
    outOfStock: '.out-of-stock',
  }

  return scrape(
    (p) => `https://${VICTORY_RIDGE_SPORTS.link}/${path}/page/${p}/?per_page=24`,
    VICTORY_RIDGE_SPORTS,
    selectors
  )
}

export function victoryRidge(type: ItemType): Promise<IItemListing[] | null> {
  switch (type) {
    case ItemType.rimfire:
      return work('product-category/ammunition/rimfire-ammunition')
    case ItemType.shotgun:
      return work('product-category/ammunition/shotgun-ammunition')
    case ItemType.centerfire:
      return work('product-category/ammunition/rifle-ammunition')
    case ItemType.case:
    case ItemType.powder:
    case ItemType.shot:
    case ItemType.primer:
      return Promise.resolve(null)
    default:
      throw new Error('Unknown type: ' + type)
  }
}
