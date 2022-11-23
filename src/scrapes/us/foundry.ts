// https://foundry.refersion.com/affiliate/registration
import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'
import { FOUNDRY } from '../../vendors-us'

import throat from 'throat'

import { combineResults } from '../../helpers'
const throttle = throat(1)

export function foundry(type: ItemType): Promise<IItemListing[]|null> {
  const selectors: Selectors = {
    item: '.product-grid-item',
    name: '.product-name',
    img: 'img',
    link: 'a',
    price: '.price-sale',
    salePrice: '.price-sale',
    nextPage: '.next',
    outOfStock: 'sold-out', // not handled by url b/c lies
  }

  const work = (t) =>
    scrape(
      (p) => `https://www.${FOUNDRY.link}/collections/${t}-ammo/availability_in-stock?page=${p}`,
      FOUNDRY,
      selectors
    )
  switch (type) {
    case ItemType.rimfire:
      return work('rimfire')

    case ItemType.centerfire:
      return Promise.all(['rifle', 'handgun'].map((t) => throttle(() => work(t)))).then(combineResults)

    case ItemType.shotgun:
      return work('shotgun')

    case ItemType.primer:
    case ItemType.case:
    case ItemType.shot:
    case ItemType.powder:
      return Promise.resolve(null) // TODO
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
