import throat from 'throat'
import * as helpers from '../../helpers'
import { ItemType, IItemListing, Province } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'

export function siwashSports(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info: Info = {
    link: 'siwashsports.ca',
    name: `Siwash Sports`,
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.product',
    name: '.info a',
    img: 'img',
    link: 'a',
    price: '.info .left',
    nextPage: '.next.enabled',
    outOfStock: '.out-of-stock',
  }

  const work = (t) => scrape((p) => `https://www.${info.link}/${t}/page${p}.html`, info, selectors)

  switch (type) {
    case ItemType.rimfire:
      // return work('ammunition/rimfire-ammunition')
      return Promise.resolve(null)

    case ItemType.centerfire:
      return Promise.all(
        ['ammunition/handgun', 'ammunition/rifle', 'ammunition/surplus'].map((t) => throttle(() => work(t)))
      ).then(helpers.combineResults)

    case ItemType.shotgun:
      return work('ammunition/shotgun')
    case ItemType.case:
    case ItemType.shot:
    case ItemType.primer:
    case ItemType.powder:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
