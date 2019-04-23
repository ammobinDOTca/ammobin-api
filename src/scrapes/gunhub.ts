import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'

export function gunhub(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    site: 'gun-hub.mybigcommerce.com',
    vendor: `Canadian Gunhub`,
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

  const BASE = 'https://gun-hub.mybigcommerce.com/ammunition'
  switch (type) {
    case ItemType.centerfire:
    case ItemType.shotgun:
    case ItemType.rimfire:
      return scrape(p => `${BASE}/?page=${p}`, info, selectors).then(items =>
        helpers.classifyBullets(items, type)
      )

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
