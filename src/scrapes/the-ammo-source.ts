import * as helpers from '../helpers'
import throat = require('throat')
import { ItemType, IItemListing, Province } from '../graphql-types'

import { scrape, Info, Selectors } from './common'

export function theAmmoSource(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info: Info = {
    site: 'theammosource.com',
    vendor: 'The Ammo Source',
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
  const BASE = `https://${info.site}`
  switch (type) {
    case ItemType.rimfire:
      return scrape(
        p => `${BASE}/rimfire-ammunition/?sort=featured&page=${p}`,
        info,
        selectors
      ).then(helpers.classifyRimfire)

    case ItemType.shotgun:
      return scrape(
        p => `${BASE}/shotgun-ammunition/?sort=featured&page=${p}`,
        info,
        selectors
      ).then(helpers.classifyShotgun)

    case ItemType.centerfire:
      return Promise.all(
        ['rifle-ammunition', 'pistol-ammunition', 'surplus-ammunition'].map(t =>
          throttle(() =>
            scrape(
              p => `${BASE}/${t}/?sort=featured&page=${p}`,
              info,
              selectors
            )
          )
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
