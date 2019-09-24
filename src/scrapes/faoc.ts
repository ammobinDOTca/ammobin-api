import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'

import { scrape, Info, Selectors } from './common'

function makeFaocReq(ammotype: String) {
  const info: Info = {
    site: 'firearmsoutletcanada.com',
    vendor: `Firearms Outlet Canada`,
    provinces: [Province.ON],
  }

  const selectors: Selectors = {
    item: '.item',
    name: '.product-name',
    img: '.product-image a',
    link: '.product-name a',
    price: '.price',

    // nextPage: '.next',
    outOfStock: '.out-of-stock',
  }

  return scrape(
    p => `https://www.${info.site}/${ammotype}?limit=all`,
    info,
    selectors
  )
}

export function faoc(type: ItemType): Promise<IItemListing[]> {
  switch (type) {
    case ItemType.rimfire:
      return makeFaocReq('ammo/rimfire-ammunition')
    case ItemType.shotgun:
      return makeFaocReq('ammo/shotgun-ammuntion')
    case ItemType.centerfire:
      return Promise.all([
        makeFaocReq('ammo/rifle-ammunition'),
        makeFaocReq('ammo/pistol-ammunition'),
      ]).then(helpers.combineResults)

    case ItemType.case:
      //return makeFaocReq('reloading/brass')
      return Promise.resolve(null)
    case ItemType.powder:
      return makeFaocReq('reloading/powders')
    case ItemType.shot:
      return makeFaocReq('reloading/projectiles')
    case ItemType.primer:
      return makeFaocReq('reloading/primers')
    default:
      throw new Error(`unknown type: ${type}`)
  }
}
