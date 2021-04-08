import * as helpers from '../../helpers'
import throat from 'throat'
import { ItemType, IItemListing, Province } from '../../graphql-types'
import { Info, Selectors, scrape } from '../common'

function work(path: String) {
  const info: Info = {
    link: 'g4cgunstore.com',
    name: `G4C`,
    provinces: [Province.ON],
  }

  const selectors: Selectors = {
    item: '.product-grid-item',
    name: '.product-title',
    img: '.product-image-link img',
    link: '.product-image-link',
    price: '.price .amount',
    outOfStock: '.outOfStock',
    salePrice: '.price ins .amount',

    nextPage: '.next',
  }
  const BASE = 'https://' + info.link
  return scrape((p) => `${BASE}/product-category/ammunition/${path}/page/${p}`, info, selectors)
}

export function g4c(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)

  switch (type) {
    case ItemType.rimfire:
    case ItemType.centerfire:
      return Promise.all(['rifle-ammo', 'bulk-ammo', 'handgun-ammo'].map((t) => throttle(() => work(t)))).then(
        helpers.combineResults
      )
    case ItemType.shotgun:
      return work('shotgun-ammo')

    case ItemType.shot:
    case ItemType.case:
    case ItemType.powder:
    case ItemType.primer:
      return Promise.resolve(null) // no reloading  as of 20190511
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
