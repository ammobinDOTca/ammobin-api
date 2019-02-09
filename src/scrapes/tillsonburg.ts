import * as helpers from '../helpers'
import { AmmoType, IAmmoListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'
export async function tillsonburg(type: AmmoType): Promise<IAmmoListing[]> {
  const info: Info = {
    site: 'tillsonburggunshop.com',
    vendor: 'tillsonburg',
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
    case AmmoType.rimfire:
      return [] // no rimfire as of 20190208
    case AmmoType.centerfire:
      return scrape(getUrl('Ammunition/Centerfire'), info, selectors).then(
        helpers.classifyCenterfire
      )
    case AmmoType.shotgun:
      return scrape(
        getUrl('index.php?route=product/category&path=170_180'),
        info,
        selectors
      ).then(helpers.classifyShotgun)
    default:
      throw new Error('unknown type: ' + type)
  }
}
