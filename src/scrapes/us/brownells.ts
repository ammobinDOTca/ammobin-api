// https://www.brownells.com/aspx/general/affiliates.aspx

import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'
import { BROWNELLS } from '../../vendors-us'

export function brownells(type: ItemType): Promise<IItemListing[]|null> {
  // todo - break out more info

  const selectors: Selectors = {
    item: '.listing',
    name: '[itemprop="name"]',
    img: 'img[itemprop="image"]',
    link: 'a',
    price: '[itemprop="lowPrice"] , [itemprop="highPrice"]', // they also have a low price
    // nextPage: '.next:not([disabled="true"])', // todo
    // outOfStock: '.card-bulkOrder-action [data-event-type="product-click"]', // handled by url
  }
  //
  const work = (t) =>
    scrape(
      (p) =>
        `https://${BROWNELLS.link}/ammunition/index.htm?avs%7cSpecial-Filters_1=In%2bStock&psize=96&f_a=${
          (p - 1) * 96 + 1
        }`,
      BROWNELLS,
      selectors
    )
  switch (type) {
    case ItemType.rimfire:
    case ItemType.centerfire:
    case ItemType.shotgun:
      return work('')

    case ItemType.primer:
    case ItemType.case:
    case ItemType.shot:
    case ItemType.powder:
      return Promise.resolve(null)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
