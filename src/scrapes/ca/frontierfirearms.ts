import helpers = require('../../helpers')
import throat from 'throat'
import { ItemType, IItemListing, Province } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'
function work(type: string): Promise<IItemListing[]|null> {
  const info: Info = {
    link: 'frontierfirearms.ca',
    name: `Frontier Firearms`,
    provinces: [Province.SK],
  }

  const selectors: Selectors = {
    item: '.product',
    name: '.card-title',
    img: null, // images lazy loaded
    link: 'a',
    price: '.price--withoutTax',

    // nextPage: '.next',
    // outOfStock: '.out-of-stock',
  }
  return scrape((p) => `https://${info.link}/ammunition-reloading/${type}.html`, info, selectors)
}

export function frontierfirearms(type: ItemType): Promise<IItemListing[]|null> {
  const throttle = throat(1)

  switch (type) {
    case ItemType.rimfire:
      return work('rimfire-ammunition')

    case ItemType.centerfire:
      return Promise.all(
        ['surplus-ammunition', 'hand-gun-ammunition', 'centerfire-ammunition'].map((t) => throttle(() => work(t)))
      ).then(helpers.combineResults)

    case ItemType.shotgun:
      return work('shotgun-shells')
    case ItemType.case:
      return work('hornady/hornady-brass')
    case ItemType.shot:
    //return work('hornady/bullets')
    case ItemType.primer:
    case ItemType.powder:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
