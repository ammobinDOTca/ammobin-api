import * as helpers from '../helpers'
import { AmmoType, IAmmoListing, Province } from '../graphql-types'
import { scrape } from './common'

export function durhamoutdoors(type: AmmoType): Promise<IAmmoListing[]> {
  switch (type) {
    case AmmoType.rimfire:
    case AmmoType.centerfire:
    case AmmoType.shotgun:
      return scrape(
        page =>
          `https://durhamoutdoors.ca/Ammo-and-reloading_c_12-${page}.html`,
        {
          site: 'durhamoutdoors.ca',
          vendor: 'Durham Outdoors',
          provinces: [Province.ON],
        },
        {
          item: '.product-item',
          name: '.name',
          img: '.img img',
          link: '.name a',
          price: '.price ',
          // nextPage:'', // todo: not able to get selector
        }
      ).then(i => helpers.classifyBullets(i, type))
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
