import { ItemType, IItemListing, Province } from '../graphql-types'
import { Info, Selectors, scrape } from './common'

function work(path: String): Promise<IItemListing[]> {
  const info: Info = {
    link: 'bullseyelondon.com',
    name: `Bulls Eye London`,
    provinces: [Province.ON],
  }

  const selectors: Selectors = {
    item: '.item',
    name: '.product-name',
    img: '.product-image img',
    link: 'a',
    price: '.regular-price',
  }
  const BASE = 'https://www.' + info.link
  return scrape(p => `${BASE}/${path}/?limit=all`, info, selectors)
}

export function bullseyelondon(type: ItemType): Promise<IItemListing[]> {
  switch (type) {
    case ItemType.rimfire:
      return work('ammunition/rimfire-ammunition')
    case ItemType.centerfire:
      return work('ammunition/centerfire-ammunition')
    case ItemType.shotgun:
      return work('ammunition/shotgun')
    case ItemType.shot:
      return work('reloading/bullets')
    case ItemType.case:
      return work('reloading/brass')
    case ItemType.powder:
      return work('reloading/powder')
    case ItemType.primer:
      return work('reloading/primers')
    default:
      throw new Error(`unknown type: ${type}`)
  }
}
