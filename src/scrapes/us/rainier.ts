// https://www.rainierarms.com/affiliates/

import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'
import { RAINER } from '../../vendors-us'

import throat from 'throat'

import { combineResults } from '../../helpers'
const throttle = throat(1)

export function rainer(type: ItemType): Promise<IItemListing[]|null> {
  const selectors: Selectors = {
    item: '.products .item',
    name: '.name',
    img: '.product-image-photo',
    link: 'a',
    price: '.price',
    nextPage: '.next',
    // outOfStock: '.card-bulkOrder-action [data-event-type="product-click"]', // handled by url
  }

  const work = (t) =>
    scrape(
      (p) => `https://www.${RAINER.link}/ammunition/${t}/?product_list_limit=48&in-stock=1&p=${p}`,
      RAINER,
      selectors
    )
  switch (type) {
    case ItemType.rimfire:
      return work('rifle-ammo')

    case ItemType.centerfire:
      return Promise.all(['rifle-ammo', 'pistol-caliber'].map((t) => throttle(() => work(t)))).then(combineResults)

    case ItemType.shotgun:
      return work('shotgun-ammo')

    case ItemType.primer:
    case ItemType.case:
    case ItemType.shot:
    case ItemType.powder:
      return Promise.resolve(null) // TODO
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
