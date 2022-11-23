import * as helpers from '../../helpers'
import throat from 'throat'

import { ItemType, IItemListing, Province } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'
const throttle = throat(1)

export function wanstalls(type: ItemType): Promise<IItemListing[]|null> {
  const info: Info = {
    link: 'wanstallsonline.com',
    name: 'Wanstalls',
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.product',
    link: 'a',
    name: '.card-title',
    img: 'img',
    price: '.price--withoutTax',
    nextPage: '.pagination-item--next',
  }

  const getStuff = (t) => scrape((p) => `https://${info.link}/${t}?page=${p}`, info, selectors)

  switch (type) {
    case ItemType.rimfire:
      return getStuff('rimfire-ammunition')

    case ItemType.shotgun:
      return getStuff('shotgun-ammunition')

    case ItemType.centerfire:
      return Promise.all(['rifle-ammunition', 'handgun-ammunition'].map((t) => throttle(() => getStuff(t)))).then(
        helpers.combineResults
      )
    case ItemType.case:
    case ItemType.powder:
    case ItemType.shot:
    case ItemType.primer:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
