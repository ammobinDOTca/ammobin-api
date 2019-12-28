import { ItemType, IItemListing, Province } from '../graphql-types'

import { scrape, Info, Selectors } from './common'

export function xmetal(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    link: 'xmetaltargets.com',
    name: `Xmetal Targets`,
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
  const work = t => scrape(_ => `https://${info.link}/product-category/${t}/`, info, selectors)
  switch (type) {
    case ItemType.rimfire:
    case ItemType.shotgun:
    case ItemType.centerfire:
      return Promise.resolve(null)
    case ItemType.primer:
      return work('reloading-components/primers')
    case ItemType.powder:
      return work('hi-tek-supercoat')
    case ItemType.case:
      return work('brass-casings')
    case ItemType.shot:
      return work('bullets')
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
