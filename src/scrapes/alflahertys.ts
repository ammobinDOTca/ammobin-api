import * as helpers from '../helpers'
import { AmmoType, IAmmoListing } from '../graphql-types'

async function makeAlReq(ammotype: string, page = 1): Promise<IAmmoListing[]> {
  await helpers.delayScrape('https://www.alflahertys.com')

  return helpers.makeWrapApiReq('alflahertys', ammotype, page).then(d => {
    if (!d.items) {
      return []
    }
    console.log(
      `alflahertys: loaded ${ammotype} page${d.page} of ${d.lastPage}`
    )
    if (!isNaN(d.lastPage) && d.page < d.lastPage) {
      return makeAlReq(ammotype, page + 1).then(dd => d.items.concat(dd))
    } else {
      return d.items
    }
  })
}

/**
 * make call to alflahertys
 * @param {'rimfire'|'centerfire'|'shotgun'} type
 * @returns Promise<any[]>
 */
export function alflahertys(type: AmmoType): Promise<IAmmoListing[]> {
  if (type === AmmoType.rimfire) {
    return makeAlReq('Rimfire-Ammo').then(helpers.classifyRimfire)
  } else if (type === AmmoType.centerfire) {
    return Promise.all([
      makeAlReq('Rifle-Ammunition'), // multi page
      makeAlReq('Bulk-Rifle'),
      makeAlReq('Pistol-Ammo'), // multi page
    ])
      .then(helpers.combineResults)
      .then(helpers.classifyCenterfire)
  } else if (type === AmmoType.shotgun) {
    return makeAlReq('Shotgun-Ammo') // multi page
      .then(helpers.classifyShotgun)
  } else {
    throw new Error(`unknown type ${type}`)
  }
}
