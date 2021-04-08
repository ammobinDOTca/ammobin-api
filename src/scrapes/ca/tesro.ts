import * as helpers from '../../helpers'
import { ItemType, IItemListing, Province } from '../../graphql-types'
import throat from 'throat'
import { scrape, Info, Selectors } from '../common'
const throttle = throat(1)
export function tesro(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    link: 'tesro.ca',
    name: `Tesro`,
    provinces: [Province.ON],
  }

  const selectors: Selectors = {
    item: '.item',
    name: '.product-name',
    img: 'image',
    link: '.product-name a',
    price: '.price',

    // nextPage: '.next',
    outOfStock: '.out-of-stock',
  }

  const work = (t) => scrape((_) => `https://www.${info.link}/${t}.html?limit=all`, info, selectors)
  switch (type) {
    case ItemType.rimfire:
      return work('ammunition-and-pellets/smallbore-ammunition')
    case ItemType.centerfire:
      return Promise.all(
        ['centerfire-ammunition', 'pistol-ammunition'].map((s) => throttle(() => work('ammunition-and-pellets/' + s)))
      ).then(helpers.combineResults)
    case ItemType.shotgun:
      return Promise.resolve(null)
    case ItemType.case:
      return work('reloading/brass')
    case ItemType.shot:
      return Promise.all(
        ['bullets', 'pistol-bullets', 'lapua-hunting-bullets'].map((t) => throttle(() => work('reloading/' + t)))
      ).then(helpers.combineResults)
    case ItemType.primer:
      return work('reloading/primers')
    case ItemType.powder:
      return work('reloading/powder')
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
