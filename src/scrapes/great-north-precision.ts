import throat from 'throat'

import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'
import { RENDERTRON_URL } from '../constants'
const throttle = throat(1)

export async function greatNorthPercision(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    link: 'greatnorthprecision.com',
    name: 'Great North Percision',
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

  const getUrl = t => page => `${RENDERTRON_URL}/render/https://www.${info.link}/${t}?page=${page}&show=100`
  switch (type) {
    case ItemType.rimfire:
      return Promise.all(['Rimfire-Ammo'].map(t => throttle(() => scrape(getUrl('ammo/' + t), info, selectors)))).then(
        helpers.combineResults
      )
    case ItemType.centerfire:
      return Promise.all(
        ['Rifle-Ammo', 'Pistol-Ammo'].map(t => throttle(() => scrape(getUrl('ammo/' + t), info, selectors)))
      ).then(helpers.combineResults)
    case ItemType.shotgun:
      return scrape(getUrl('ammo/Shotgun-Ammo'), info, selectors)
    case ItemType.case:
      return scrape(getUrl('reloading/Brass'), info, selectors)
    case ItemType.powder:
    case ItemType.primer:
      return scrape(getUrl('reloading/Powders-Primers'), info, selectors)
    case ItemType.shot:
      return scrape(getUrl('reloading/Bullets'), info, selectors)
    default:
      throw new Error('unknown type: ' + type)
  }
}
