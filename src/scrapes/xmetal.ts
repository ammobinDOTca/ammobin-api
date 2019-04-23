import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'

import { scrape, Info, Selectors } from './common'

export function xmetal(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    site: 'xmetaltargets.com',
    vendor: `Xmetal Targets`,
    provinces: [Province.QC],
  }

  const selectors: Selectors = {
    item: '.product ',
    name: '.product-title',
    img: '.wp-post-image',
    link: 'a',
    price: '.price .amount:nth-child(1)',
    nextPage: '.next',
    outOfStock: '.out-of-stock',
  }

  switch (type) {
    case ItemType.rimfire:
    case ItemType.shotgun:
      return Promise.resolve([])
    case ItemType.centerfire:
      return scrape(
        _ => `https://xmetaltargets.com/product-category/ammunition/`,
        info,
        selectors
      ).then(helpers.classifyCenterfire)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
