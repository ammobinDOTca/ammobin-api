import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'
import { GREEN_COUNTRY } from '../../vendors-us'

import throat from 'throat'

import { combineResults } from '../../helpers'
const throttle = throat(1)

export function greenCountry(type: ItemType): Promise<IItemListing[]> {
  const selectors: Selectors = {
    item: '.product-item',
    name: '.name',
    img: 'img',
    link: 'a',
    price: '.price',
    //nextPage: '.next', // todo
    outOfStock: '.availability',
  }
  //
  const work = (t) => scrape((p) => `https://${GREEN_COUNTRY.link}/${t}.html?viewall=1`, GREEN_COUNTRY, selectors)
  switch (type) {
    case ItemType.rimfire:
      return Promise.resolve(null)
    case ItemType.centerfire:
      return Promise.all(['Pistol_c_18', 'Rifle_c_19'].map((t) => throttle(() => work(t)))).then(combineResults)
    case ItemType.shotgun:
      return work('Shotgun_c_57')

    case ItemType.primer:
    case ItemType.case:
    case ItemType.shot:
    case ItemType.powder:
      return Promise.resolve(null)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
