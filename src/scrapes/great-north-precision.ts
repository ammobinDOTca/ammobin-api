import throat from 'throat'

import * as helpers from '../helpers'
import { AmmoType, IAmmoListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'
import { RENDERTRON_URL } from '../constants'
const throttle = throat(1)

export async function greatNorthPercision(
  type: AmmoType
): Promise<IAmmoListing[]> {
  const info: Info = {
    site: 'greatnorthprecision.com',
    vendor: 'Great North Percision',
    provinces: [Province.BC],
  }
  const selectors: Selectors = {
    item: '.facets-item-cell-grid',
    name: '.facets-item-cell-grid-title',
    link: '.facets-item-cell-grid-link-image',
    img: '.facets-item-cell-grid-image',
    price: '.product-views-price', // this ommits the upper price, and introduces rounding error...
    // nextPage: '.global-views-pagination-next', // todo: fix this
  }

  const getUrl = t => page =>
    `${RENDERTRON_URL}/render/https://www.${
      info.site
    }/ammo/${t}?page=${page}&show=100`
  switch (type) {
    case AmmoType.rimfire:
      return Promise.all(
        ['Rimfire-Ammo'].map(t =>
          throttle(() => scrape(getUrl(t), info, selectors))
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classifyRimfire)
    case AmmoType.centerfire:
      return Promise.all(
        ['Rifle-Ammo', 'Pistol-Ammo'].map(t =>
          throttle(() => scrape(getUrl(t), info, selectors))
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)
    case AmmoType.shotgun:
      return scrape(getUrl('Shotgun-Ammo'), info, selectors).then(
        helpers.classifyShotgun
      )
    default:
      throw new Error('unknown type: ' + type)
  }
}
