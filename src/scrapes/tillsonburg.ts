import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'
export async function tillsonburg(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    site: 'tillsonburggunshop.com',
    vendor: 'Tillsonburg Gun Shop',
    provinces: [Province.ON],
  }
  const selectors: Selectors = {
    item: '.product-thumb',
    name: '.caption h4',
    link: '.caption a',
    img: '.image img',
    price: '.price',
  }
  const getUrl = t => page => `https://tillsonburggunshop.com/${t}`
  switch (type) {
    case ItemType.rimfire:
      return Promise.resolve(null) // no rimfire as of 20190208
    case ItemType.centerfire:
      return scrape(getUrl('Ammunition/Centerfire'), info, selectors).then(
        helpers.classifyCenterfire
      )
    case ItemType.shotgun:
      return scrape(
        getUrl('index.php?route=product/category&path=170_180'),
        info,
        selectors
      ).then(helpers.classifyShotgun)
    default:
      throw new Error('unknown type: ' + type)
  }
}
