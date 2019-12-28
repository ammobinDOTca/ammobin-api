import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'
export async function tillsonburg(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    link: 'tillsonburggunshop.com',
    name: 'Tillsonburg Gun Shop',
    provinces: [Province.ON],
  }
  const selectors: Selectors = {
    item: '.product-thumb',
    name: '.caption h4',
    link: '.caption a',
    img: '.image img',
    price: '.price',
  }
  const getUrl = t => page => `https://${info.link}/${t}`
  switch (type) {
    case ItemType.rimfire:
      return Promise.resolve(null) // no rimfire as of 20190208
    case ItemType.centerfire:
      return scrape(getUrl('Ammunition/Centerfire'), info, selectors).then(helpers.classifyCenterfire)
    case ItemType.shotgun:
      return scrape(getUrl('index.php?route=product/category&path=170_180'), info, selectors).then(
        helpers.classifyShotgun
      )
    // todo: there is actual reloading
    case ItemType.case:
    case ItemType.powder:
    case ItemType.primer:
    case ItemType.shot:
      return Promise.resolve([])
    default:
      throw new Error('unknown type: ' + type)
  }
}
