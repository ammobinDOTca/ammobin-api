import * as helpers from '../helpers'
import throat from 'throat'
import { ItemType, IItemListing, Province } from '../graphql-types'

import { scrape, Info, Selectors } from './common'

export function westernMetal(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    link: 'westernmetal.ca',
    name: 'Western Metal',
    provinces: [Province.AB],
  }

  const selectors: Selectors = {
    item: '.view-content .views-row',
    name: '',
    link: '.views-field-title a',
    price: '.views-field-php',
    img: '.views-field-field-product-image img',
    nextPage: '.next',
    outOfStock: '.out-stock',
  }
  const remapName = (items: IItemListing[]) =>
    items.map(result => {
      const split = result.link.split('/')
      result.name = split[split.length - 1].split('-').join(' ')
      return result
    })
  const fn = (section, t?) =>
    scrape(
      page =>
        `https://www.${info.link}/shooting-category/${section}?${
          t ? 'field_product_types_tid[]=' + t + '&' : ''
        }sort_order=DESC&page=${page}`,
      info,
      selectors
    ).then(remapName)

  const throttle = throat(1)
  switch (type) {
    case ItemType.rimfire:
      return Promise.resolve(null)

    case ItemType.centerfire:
      return Promise.all([
        throttle(() => fn('new-ammunition', 80)),
        throttle(() => fn('new-ammunition', 81)),
        throttle(() => fn('remanufactured-ammunition', 80)),
        throttle(() => fn('remanufactured-ammunition', 81)),
      ]).then(helpers.combineResults)

    case ItemType.shotgun:
      return fn('new-ammunition', 538)

    case ItemType.shot:
      return Promise.all(
        ['bullets-lead', 'bullets-plated', 'bullets-jacketed', 'lead-shot'].map(f => throttle(() => fn(f)))
      ).then(helpers.combineResults)

    case ItemType.primer:
      return fn('primers')
    case ItemType.case:
      return fn('brass')
    case ItemType.powder:
      return fn('smokeless-powders')
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
