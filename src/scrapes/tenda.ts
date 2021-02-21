import * as helpers from '../helpers'
import throat from 'throat'
import { RENDERTRON_URL } from '../constants'

import { ItemType, IItemListing } from '../graphql-types'
import { scrape, Info, Selectors } from './common'
import { TENDA } from '../vendors'

export function tenda(type): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info: Info = TENDA

  const selectors: Selectors = {
    item: '.product-grid  .item-product',
    name: '.title-product',
    img: '.product-thumb-link img',
    link: '.product-thumb-link',
    price: '.woocommerce-Price-amount',
    nextPage: '.product-pagi-nav .next',
    //outOfStock: '.out-of-stock',
  }

  function makeTendaRequest(t) {
    return scrape(
      (page) =>
        `${RENDERTRON_URL}/render/https://www.${TENDA.link}/product-category/${t}/${
          page > 1 ? 'page/' + page + '/' : ''
        }?number=48`,
      info,
      selectors
    )
  }
  switch (type) {
    case ItemType.rimfire:
      return Promise.all(
        ['rimfire-ammo', 'bulk-ammo'].map((t) => throttle(() => makeTendaRequest('ammunition/' + t)))
      ).then(helpers.combineResults)

    case ItemType.centerfire:
      return Promise.all(
        ['rifle-ammo', 'handgun-ammo', 'bulk-ammo'].map((t) => throttle(() => makeTendaRequest('ammunition/' + t)))
      ).then(helpers.combineResults)

    case ItemType.shotgun:
      return Promise.all(
        ['shotgun-ammo', 'bulk-ammo'].map((t) => throttle(() => makeTendaRequest('ammunition/' + t)))
      ).then(helpers.combineResults)
    case ItemType.powder:
      return makeTendaRequest('reloading/gun-powders')
    case ItemType.case:
    case ItemType.primer:
      return Promise.resolve(null)
    case ItemType.shot:
      return makeTendaRequest('reloading/brass-bullet')
    default:
      throw new Error(`unknown type: ${type}`)
  }
}
