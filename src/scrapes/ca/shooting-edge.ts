import throat from 'throat'

import { ItemType, IItemListing, Province } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'
import { combineResults } from '../../helpers'
const throttle = throat(1)

export function shootingEdge(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    link: 'theshootingedge.com',
    name: `The Shooting Edge`,
    provinces: [Province.AB],
  }

  const selectors: Selectors = {
    item: '.productListing',
    name: '.name',
    img: 'img',
    link: 'a',
    price: '.pricing',
    nextPage: '.next-only',
    outOfStock: '.product-card__availability',
  }
  const work = (t) => scrape((p) => `https://www.${info.link}/custom/${t}/page/${p}`, info, selectors)

  switch (type) {
    case ItemType.rimfire:
      return work('ammunition-and-reloading-ammunition-rimfire-ammo')
    case ItemType.centerfire:
      return Promise.all(
        [
          'ammunition-and-reloading-ammunition-centrefire-handgun-ammo',
          'ammunition-and-reloading-ammunition-centrefire-rifle-ammo',
        ].map((t) => throttle(() => work(t)))
      ).then(combineResults)
    case ItemType.shotgun:
      return work('ammunition-and-reloading-ammunition-shotgun-ammo')
    case ItemType.powder:
      return work('ammunition-and-reloading-reloading-powder')
    case ItemType.case:
      return work('ammunition-and-reloading-reloading-cases')
    case ItemType.primer:
      return work('ammunition-and-reloading-reloading-primers')
    case ItemType.shot:
      return work('ammunition-and-reloading-reloading-bullets')
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
