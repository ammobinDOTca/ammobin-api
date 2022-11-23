// TODO https://www.natchezss.com/affiliates

import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'
import { NATCHEZ } from '../../vendors-us'

import throat from 'throat'

import { combineResults } from '../../helpers'
const throttle = throat(1)

export function natchez(type: ItemType): Promise<IItemListing[]|null> {
  const selectors: Selectors = {
    item: '.item',
    name: '.product-name',
    img: 'img',
    link: 'a',
    price: '.sli_price', // they also have a low price
    nextPage: '.next', // todo
    // outOfStock: '.card-bulkOrder-action [data-event-type="product-click"]', // handled by url
  }
  //
  const work = (t) =>
    scrape(
      (p) => `https://${NATCHEZ.link}/products/ammunition-${t}-ammo-in-stock/${(p - 1) * 64}?cnt=64`,
      NATCHEZ,
      selectors
    )
  switch (type) {
    case ItemType.rimfire:
      return Promise.resolve(null) // TODO
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
