import throat from 'throat'
import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'

export function siwashSports(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info: Info = {
    site: 'siwashsports.ca',
    vendor: `Siwash Sports`,
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.product ',
    name: '.woocommerce-loop-product__title',
    img: '.wp-post-image',
    link: 'a',
    price: '.amount',
    nextPage: '.next',
    outOfStock: '.out-of-stock',
  }

  const work = t =>
    scrape(
      p => `https://www.${info.site}/product-category/${t}?page=${p}`,
      info,
      selectors
    )

  switch (type) {
    case ItemType.rimfire:
      return work('ammunition/rimfire-ammunition')

    case ItemType.centerfire:
      return Promise.all(
        ['ammunition/centerfire-ammunition', 'surplus/surplus-ammunition'].map(
          t => throttle(() => work(t))
        )
      ).then(helpers.combineResults)

    case ItemType.shotgun:
      return work('ammunition/shotgun-ammunition')
    case ItemType.case:
    case ItemType.shot:
    case ItemType.primer:
    case ItemType.powder:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
