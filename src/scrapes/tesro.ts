import * as helpers from '../helpers'
import { AmmoType, IAmmoListing, Province } from '../graphql-types'

import { scrape, Info, Selectors } from './common'

export function tesro(type: AmmoType): Promise<IAmmoListing[]> {
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
    case AmmoType.rimfire:
      return scrape(
        _ =>
          `https://www.${
            info.site
          }/ammunition-and-pellets/smallbore-ammunition.html?limit=all`,
        info,
        selectors
      ).then(helpers.classifyRimfire)
    case AmmoType.centerfire:
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
    case AmmoType.shotgun:
      return Promise.resolve([])
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
