import { ItemType, IItemListing, Province } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'

export function gunhub(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    link: 'gun-hub.mybigcommerce.com',
    name: `Canadian Gunhub`,
    provinces: [Province.AB],
  }

  const selectors: Selectors = {
    item: '.product .card',
    name: '.card-title',
    img: '.card-image',
    link: '.card-title a',
    price: '.price',

    nextPage: '.pagination-item--next',
    outOfStock: '.out-of-stock',
  }

  const BASE = `https://${info.link}`
  switch (type) {
    case ItemType.centerfire:
    case ItemType.shotgun:
    case ItemType.rimfire:
      return scrape((p) => `${BASE}/ammunition/?page=${p}`, info, selectors)
    case ItemType.case:
    case ItemType.powder:
    case ItemType.shot:
    case ItemType.primer:
      return scrape((p) => `${BASE}/reloading/?page=${p}`, info, selectors)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
