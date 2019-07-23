import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'

export function theShootingCenter(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    site: 'store.theshootingcentre.com',
    vendor: `Calgary Shooting Center`,
    provinces: [Province.AB],
  }

  const selectors: Selectors = {
    item: '.product-item',
    name: '.product-item-link',
    img: '.product-image-photo',
    link: '.product-item-link',
    price: '.price',
    //nextPage: '.pages-item-next',
    //outOfStock: '.out-of-stock',
  }
  const work = t =>
    scrape(
      _ => `https://${info.site}/${t}?product_list_limit=all`,
      info,
      selectors
    )

  switch (type) {
    case ItemType.rimfire:
      return work('ammunition/rimfire')
    case ItemType.centerfire:
      return work('ammunition/centrefire')
    case ItemType.shotgun:
      return work('ammunition/shotshell')
    case ItemType.primer:
      return work('reloading/primers')
    case ItemType.powder:
      return work('reloading/powder')
    case ItemType.case:
    case ItemType.shot:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
