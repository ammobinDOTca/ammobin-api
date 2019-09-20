import throat from 'throat'

import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'
const throttle = throat(1)

export async function crafm(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    site: 'crafm.com',
    vendor: 'CRAFM',
    provinces: [Province.QC],
  }
  const selectors: Selectors = {
    item: '.product',
    name: '.product-info h6',
    link: '.top-product-section a',
    img: '.attachment-woocommerce_thumbnail',
    price: '.woocommerce-Price-amount',
    nextPage: '.next',
  }
  const getUrl = t => page =>
    `https://www.${info.site}/product-category/${t}/page/${page}/`
  switch (type) {
    case ItemType.rimfire:
      return Promise.all(
        ['handgun', 'revolver-2'].map(t =>
          throttle(() => scrape(getUrl('ammunition/' + t), info, selectors))
        )
      ).then(helpers.combineResults)
    case ItemType.centerfire:
      return Promise.all(
        ['handgun', 'revolver-2', 'rifle'].map(t =>
          throttle(() => scrape(getUrl('ammunition/' + t), info, selectors))
        )
      ).then(helpers.combineResults)
    case ItemType.shotgun:
      return Promise.resolve(null)
    /*return scrape(getUrl('ammunition/shotgun'), info, selectors).then(
        helpers.classifyShotgun
      )*/
    case ItemType.powder:
      return scrape(
        getUrl('reloading-equipment/powder-primers'),
        info,
        selectors
      )
    case ItemType.shot:
    //return scrape(getUrl('ammunition/projectiles'), info, selectors)
    case ItemType.primer:
    case ItemType.case:
      return Promise.resolve(null)
    default:
      throw new Error('unknown type: ' + type)
  }
}
