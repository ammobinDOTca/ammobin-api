import * as helpers from '../../helpers'
import { ItemType, IItemListing, Province } from '../../graphql-types'
import { scrape } from '../common'

export function durhamoutdoors(type: ItemType): Promise<IItemListing[]> {
  switch (type) {
    case ItemType.centerfire:
      return scrape(
        (page) => `https://durhamoutdoors.ca/Ammo-and-reloading_c_12-${page}.html`,
        {
          link: 'durhamoutdoors.ca',
          name: 'Durham Outdoors',
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
      ).then((i) => helpers.classifyBullets(i, type))
    case ItemType.rimfire:
    case ItemType.shotgun:
    case ItemType.case:
    case ItemType.powder:
    case ItemType.shot:
    case ItemType.primer:
      return Promise.resolve(null) // 20190519 TODO: check on this site later, they keep things too messy for now.
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
