import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'
import { BOTACH } from '../../vendors-us'

export function botach(type: ItemType): Promise<IItemListing[]> {
  const selectors: Selectors = {
    item: '.page-content .product',
    name: '.card-title',
    img: 'img',
    link: 'a',
    price: '.price-section .price--main',
    nextPage: '.pagination-item--next',
    outOfStock: '.card-bulkOrder-action [data-event-type="product-click"]',
  }

  const work = (t) => scrape((p) => `https://${BOTACH.link}/ammunition/?page=${p}`, BOTACH, selectors)
  switch (type) {
    case ItemType.rimfire:
    case ItemType.centerfire:
    case ItemType.shotgun:
      return work('')

    case ItemType.primer:
    case ItemType.case:
    case ItemType.shot:
    case ItemType.powder:
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
