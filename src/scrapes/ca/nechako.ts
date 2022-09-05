import { NECHAKO } from '../../vendors'
import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'
import * as helpers from '../../helpers'

function work(path: String) {
  const selectors: Selectors = {
    item: '.product',
    name: '.card-title',
    img: 'img',
    link: 'a',
    price: '[data-product-price-without-tax]',
    nextPage: '.pagination-item--next',
    outOfStock: '.fusion-out-of-stock',
  }

  return scrape(
    (p) => `https://${NECHAKO.link}/${path}/?_bc_fsnf=1&in_stock=1&page=${p}`,
    NECHAKO,
    selectors
  )
}

export function nechako(type: ItemType): Promise<IItemListing[]> {
  switch (type) {
    case ItemType.rimfire:
      return work('ammunition/rimfire')

    case ItemType.shotgun:
      return work('ammunition/shotshells')

    case ItemType.centerfire:

      return Promise.all(['centerfire-rifle', 'pistol'].map(t => work('ammunition/' + t))).then(helpers.combineResults)
    case ItemType.case:
      return work('reloading/brass')
    case ItemType.powder:
      return work('reloading/powder')
    case ItemType.shot:
      return work('reloading/bullets')
    case ItemType.primer:
      return work('reloading/primer')
    default:
      throw new Error('Unknown type: ' + type)
  }
}
