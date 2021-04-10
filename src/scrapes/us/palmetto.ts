//https://palmettostatearmory.com/help-center/affiliate-program.html#affiliate-program

// TODO use their api, no bots allowed access....

import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'
import { PALMETTO } from '../../vendors-us'

import throat from 'throat'

import { combineResults } from '../../helpers'
import { RENDERTRON_URL } from '../../constants'
const throttle = throat(1)

export function palmetto(type: ItemType): Promise<IItemListing[]> {
  const selectors: Selectors = {
    item: '.item',
    name: '.name',
    img: 'img',
    link: 'a',
    price: '[data-price-type="finalPrice"] .price', // they also have a low price
    pricePerRound: '.unit-price',
    nextPage: '.next',
    // outOfStock: '.card-bulkOrder-action [data-event-type="product-click"]', // handled by url
  }
  //
  const work = (t) =>
    scrape(
      (p) => `${RENDERTRON_URL}/render/https://${PALMETTO.link}/ammo/${t}.html?stock_filter=Show+Only+In+Stock&p=${p}`,
      PALMETTO,
      selectors
    )
  switch (type) {
    case ItemType.rimfire:
      return work('rimfire-ammo') // TODO
    case ItemType.centerfire:
      return Promise.all(['rifle-ammo', 'handgun-ammo'].map((t) => throttle(() => work(t)))).then(combineResults)

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
