import * as helpers from '../../helpers'
import throat from 'throat'
import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'
import { NAS } from '../../vendors'

export function nas(type: ItemType): Promise<IItemListing[]|null> {
  const throttle = throat(1)
  const info: Info = NAS

  const selectors: Selectors = {
    item: '#main .product',
    name: '.name',
    img: 'img',
    link: '.name a',
    price: '.price',
    nextPage: '.pagination-item-next-link',
    outOfStock: '.out-of-stock-label',
  }
  const work = (t) =>
    scrape(
      (p) => `https://${info.link}/product-category/${t}/page/${p}/`,

      info,
      selectors
    )

  switch (type) {
    case ItemType.rimfire:
      return work('ammo/rimfire')

    case ItemType.centerfire:
      return Promise.all(
        [
          'centrefire', // look at these fancy fellows...
          // 'surplus-ammo',
        ].map((t) => throttle(() => work('ammo/' + t)))
      ).then(helpers.combineResults)

    case ItemType.shotgun:
      return work('ammo/shotgun')
    case ItemType.shot:
      return work('reloading-supplies/bullets')
    case ItemType.case:
      return work('reloading-supplies/brass')
    case ItemType.powder:
      return work('reloading-supplies/gun-powder')
    case ItemType.primer:
      return work('reloading-supplies/primers')
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
