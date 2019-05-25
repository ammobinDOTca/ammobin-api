import throat from 'throat'
import { scrape, Info, Selectors } from './common'
import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'

export function vancouvergunstore(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info: Info = {
    site: 'vancouvergunstore.ca',
    vendor: 'Vancouver Gun Store',
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.product-inner',
    name: '.woocommerce-loop-product__title',
    img: '.attachment-woocommerce_thumbnail',
    link: '.woocommerce-LoopProduct-link',
    price: '.woocommerce-Price-amount',
    nextPage: '.next',
  }

  const BASE = 'https://vancouvergunstore.ca/product-category/ammunition/'
  switch (type) {
    case ItemType.rimfire:
      return scrape(p => `${BASE}/rimfire?paged=${p}`, info, selectors).then(
        items => helpers.classifyRimfire(items)
      )

    case 'centerfire':
      return Promise.all(
        ['pistol', 'rifle', 'bulk'].map(t =>
          throttle(() =>
            scrape(p => `${BASE}/${t}?paged=${p}`, info, selectors)
          )
        )
      )
        .then(helpers.combineResults)
        .then(items => helpers.classifyCenterfire(items))

    case 'shotgun':
      return scrape(
        p => `${BASE}/shotgun-ammunition?paged=${p}`,
        info,
        selectors
      ).then(items => helpers.classifyShotgun(items))

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
