import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'

export function shootingEdge(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    site: 'theshootingedge.com',
    vendor: `The Shooting Edge`,
    provinces: [Province.AB],
  }

  const selectors: Selectors = {
    item: '.main-content .grid__item',
    name: '.product-card__name',
    img: '.product-card__image',
    link: '.product-card',
    price: '.product-card__price',
    nextPage: '.next',
    outOfStock: '.product-card__availability',
  }
  const work = t =>
    scrape(
      p => `https://${info.site}/collections/${t}?page=${p}`,
      info,
      selectors
    )

  switch (type) {
    case ItemType.rimfire:
    case ItemType.centerfire:
    case ItemType.shotgun:
      return work('ammunition-1')
    case ItemType.powder:
    case ItemType.case:
    case ItemType.primer:
    case ItemType.shot:
      return work('reloading')
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
