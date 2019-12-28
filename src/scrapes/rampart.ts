import * as helpers from '../helpers'
import throat from 'throat'
import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'

export function rampart(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info: Info = {
    link: 'rampartcorp.com',
    name: 'Rampart',
    provinces: [Province.ON],
  }
  const selectors: Selectors = {
    item: '.product',
    name: '.card-title',
    img: '', // '.card-image', // disabled since images load async
    link: '.card-figure a',
    price: '.price',
  }
  switch (type) {
    case ItemType.centerfire:
      return Promise.all(
        ['rifle', 'pistol'].map(t =>
          throttle(() => scrape(page => `https://rampartcorp.com/firearms/ammunition/${t}-calibers/`, info, selectors))
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)

    case ItemType.shotgun:
    case ItemType.rimfire:
      return Promise.resolve(null) // 20190324: not selling rimfire or shotgun.
    case ItemType.shot:
    case ItemType.primer:
    case ItemType.case:
    case ItemType.powder:
      return Promise.resolve(null) // no reloading as of 20190616

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
