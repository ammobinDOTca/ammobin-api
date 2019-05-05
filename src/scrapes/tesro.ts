import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'

import { scrape, Info, Selectors } from './common'

export function tesro(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    site: 'tesro.ca',
    vendor: `Tesro`,
    provinces: [Province.ON],
  }

  const selectors: Selectors = {
    item: '.item',
    name: '.product-name',
    img: 'image',
    link: '.product-name a',
    price: '.price',

    // nextPage: '.next',
    outOfStock: '.out-of-stock',
  }

  switch (type) {
    case ItemType.rimfire:
      return scrape(
        _ =>
          `https://www.${
            info.site
          }/ammunition-and-pellets/smallbore-ammunition.html?limit=all`,
        info,
        selectors
      ).then(helpers.classifyRimfire)
    case ItemType.centerfire:
      return Promise.all(
        ['centerfire-ammunition', 'pistol-ammunition'].map(s =>
          scrape(
            _ =>
              `https://www.${
                info.site
              }/ammunition-and-pellets/${s}.html?limit=all`,
            info,
            selectors
          )
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)
    case ItemType.shotgun:
      return Promise.resolve([])
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
