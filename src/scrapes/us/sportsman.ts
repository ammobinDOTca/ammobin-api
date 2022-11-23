// https://www.sportsmans.com/sportsmans-warehouse-affiliate-program

import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'
import { SPORTSMAN } from '../../vendors-us'

import throat from 'throat'

import { combineResults } from '../../helpers'
const throttle = throat(1)

export function sportsman(type: ItemType): Promise<IItemListing[]|null> {
  const selectors: Selectors = {
    item: '.product-item',
    name: '.name',
    img: 'img',
    link: 'a',
    price: '.displayed-price', // they also have a low price
    pricePerRound: '.smw-price-per-unit',
    nextPage: '.pagination-next',
    outOfStock: '.smw-product-no-stock', // handled by url
  }

  const work = (t) =>
    scrape(
      (p) =>
        `https://www.${SPORTSMAN.link}/shooting-gear-gun-supplies/ammunition-ammo-for-hunting-shooting-sports/shotgun-ammo-hunting-shooting-sports/c/${t}?pageSize=100&q=%3Arelevance%3AinStockFlag%3Atrue`,
      SPORTSMAN,
      selectors
    )
  switch (type) {
    case ItemType.rimfire:
      return work('cat100113')
    case ItemType.centerfire:
      return Promise.all(['cat100130', 'cat100114'].map((t) => throttle(() => work(t)))).then(combineResults)

    case ItemType.shotgun:
      return work('cat100124')

    case ItemType.primer:
    case ItemType.case:
    case ItemType.shot:
    case ItemType.powder:
      return Promise.resolve(null) // TODO
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
