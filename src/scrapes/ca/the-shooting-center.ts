import { ItemType, IItemListing, Province } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'

export function theShootingCenter(type: ItemType): Promise<IItemListing[]|null> {
  const info: Info = {
    link: 'store.theshootingcentre.com',
    name: `Calgary Shooting Center`,
    provinces: [Province.AB],
  }

  const selectors: Selectors = {
    item: '.productCard',
    name: '.card-title',
    img: 'img',
    link: 'a',
    price: '.price',
    //nextPage: '.pages-item-next',
    //outOfStock: '.out-of-stock',
  }
  const work = (t) => scrape((_) => `https://${info.link}/${t}?limit=1000&_bc_fsnf=1&in_stock=1`, info, selectors)

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
