import * as helpers from '../../helpers'
import throat from 'throat'
import { ItemType, IItemListing, Province } from '../../graphql-types'

import { scrape, Info, Selectors } from '../common'

export function theAmmoSource(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info: Info = {
    link: 'theammosource.com',
    name: 'The Ammo Source',
    provinces: [Province.ON],
  }

  const selectors: Selectors = {
    item: '.productGrid.visible .product',
    name: '.card-title',
    img: '.card-image',
    link: 'a',
    price: '.price',
    nextPage: '.pagination-item--next',
  }
  const BASE = `https://${info.link}`
  switch (type) {
    case ItemType.rimfire:
      return scrape((p) => `${BASE}/rimfire-ammunition/?sort=featured&page=${p}`, info, selectors)
    case ItemType.shotgun:
      return scrape((p) => `${BASE}/shotgun-ammunition/?sort=featured&page=${p}`, info, selectors)
    case ItemType.centerfire:
      return Promise.all(
        ['rifle-ammunition', 'pistol-ammunition', 'surplus-ammunition'].map((t) =>
          throttle(() => scrape((p) => `${BASE}/${t}/?sort=featured&page=${p}`, info, selectors))
        )
      ).then(helpers.combineResults)
    // todo: there is actual reloading
    case ItemType.case:
    case ItemType.powder:
    case ItemType.primer:
    case ItemType.shot:
      return Promise.resolve([])
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
