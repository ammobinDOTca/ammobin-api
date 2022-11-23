//https://www.impactguns.com/affiliate-program/

import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'
import { IMPACT } from '../../vendors-us'

import throat from 'throat'

import { combineResults } from '../../helpers'
const throttle = throat(1)

export function impact(type: ItemType): Promise<IItemListing[]|null> {
  const selectors: Selectors = {
    item: '.product',
    name: '.card-title',
    img: 'img',
    link: 'a',
    price: '.price-section',
    nextPage: '.pagination-item--next',
  }

  const work = (t) =>
    scrape((p) => `https://www.${IMPACT.link}/${t}/?_bc_fsnf=1&in_stock=1&sort=featured&page=${p}`, IMPACT, selectors)
  switch (type) {
    case ItemType.rimfire:
      return work('rimfire-ammo')
    case ItemType.centerfire:
      return Promise.all(['rifle-ammo', 'handgun-ammo'].map((t) => throttle(() => work(t)))).then(combineResults)
    case ItemType.shotgun:
      return work('shotgun-ammo')

    case ItemType.primer:
    case ItemType.case:
    case ItemType.shot:
    case ItemType.powder:
      return Promise.resolve(null)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
