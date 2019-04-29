import * as helpers from '../helpers'
import { AmmoType, IAmmoListing, Province } from '../graphql-types'

import { scrape, Info, Selectors } from './common'

export function xmetal(type: AmmoType): Promise<IAmmoListing[]> {
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
    case AmmoType.rimfire:
    case AmmoType.shotgun:
      return Promise.resolve([])
    case AmmoType.centerfire:
      return scrape(
        _ => `https://xmetaltargets.com/product-category/ammunition/`,
        info,
        selectors
      ).then(helpers.classifyCenterfire)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
