import * as helpers from '../helpers'
import throat from 'throat'

import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'
const throttle = throat(1)

export function wanstalls(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    site: 'wanstallsonline.com',
    vendor: 'Wanstalls',
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.product-box-1',
    link: '.product-image',
    name: '.product-name',
    img: '.product-image img',
    price: '.special-price .price , .price-box .price',
  }

  const getStuff = t =>
    scrape(
      p => `https://www.${info.site}/ammunition/${t}.html?limit=all`,
      info,
      selectors
    )

  switch (type) {
    case ItemType.rimfire:
      return getStuff('rimfire')

    case ItemType.shotgun:
      return getStuff('shot-gun')

    case ItemType.centerfire:
      return Promise.all(
        ['pistol', 'rifle', 'surplus'].map(t => throttle(() => getStuff(t)))
      ).then(helpers.combineResults)
    case ItemType.case:
    case ItemType.powder:
    case ItemType.shot:
    case ItemType.primer:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
