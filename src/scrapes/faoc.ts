import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'

import { scrape, Info, Selectors } from './common'

function makeFaocReq(ammotype: String) {
  const info: Info = {
    link: 'firearmsoutletcanada.com',
    name: `Firearms Outlet Canada`,
    provinces: [Province.ON],
  }

  const selectors: Selectors = {
    item: '.product-item',
    name: '.product-item-link',
    img: 'img',
    link: 'a',
    price: '.price',

    // nextPage: '.next',
    outOfStock: '.unavailable',
  }

  return scrape((p) => `https://www.${info.link}/${ammotype}?limit=all`, info, selectors)
}

export function faoc(type: ItemType): Promise<IItemListing[]> {
  switch (type) {
    case ItemType.rimfire:
      return makeFaocReq('ammo/rimfire-ammunition')
    case ItemType.shotgun:
      return makeFaocReq('ammo/shotgun-ammuntion')
    case ItemType.centerfire:
      return Promise.all([makeFaocReq('ammo/rifle-ammunition'), makeFaocReq('ammo/pistol-ammunition')]).then(
        helpers.combineResults
      )

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
