import { ItemType, IItemListing, Province } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'
import { combineResults } from '../../helpers'
import throat from 'throat'

export function bvoutdoors(type: ItemType): Promise<IItemListing[]|null> {
  const throttle = throat(1)
  const info: Info = {
    link: 'bvoutdoors.com',
    name: `BV Outdoor Essentials`,
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.product-element',
    name: '.product-title',
    img: 'meta[itemprop="image"]',
    link: 'a',
    price: '.new-price',
    //brand: '.caption h6',
    // nextPage: '.next :not(.disabled)',
    //    outOfStock: '.out-of-stock',
  }

  const work = (t) => scrape((page) => `https://www.${info.link}/${t}`, info, selectors)
  switch (type) {
    case ItemType.rimfire:
      return work('ammunition/rimfire-rifle-ammunition/')

    case ItemType.centerfire:
      return Promise.all(
        ['ammunition/handgun-ammunition', 'ammunition/centerfire-rifle-ammunition'].map((t) => throttle(() => work(t)))
      ).then(combineResults)

    case ItemType.shotgun:
      return Promise.all(['ammunition/shotgun-ammunition/'].map((t) => throttle(() => work(t)))).then(combineResults)
    case ItemType.case:
      return work('shooting/reloading/reloading-brass')
    case ItemType.shot:
      return work('shooting/reloading/reloading-bullets')
    case ItemType.primer:
      return work('shooting/reloading/reloading-primers')
    case ItemType.powder:
      return work('shooting/reloading/reloading-powder')
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
