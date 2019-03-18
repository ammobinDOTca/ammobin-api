import * as helpers from '../helpers'
import { AmmoType, IAmmoListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'

export function gunhub(type: AmmoType): Promise<IAmmoListing[]> {
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
    case AmmoType.centerfire:
    case AmmoType.shotgun:
    case AmmoType.rimfire:
      return scrape(p => `${BASE}/?page=${p}`, info, selectors).then(items =>
        helpers.classifyBullets(items, type)
      )

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
