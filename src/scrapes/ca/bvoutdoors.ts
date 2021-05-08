import { ItemType, IItemListing, Province } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'
import { combineResults } from '../../helpers'
import throat from 'throat'

export function bvoutdoors(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info: Info = {
    link: 'bvoutdoors.com',
    name: `BV Outdoor Essentials`,
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.product-list-item',
    name: '.productnameTitle',
    img: '.image-thumb',
    link: '.product-link',
    price: '.text-price',
    //brand: '.caption h6',
    nextPage: '.button-small.next',
    //    outOfStock: '.out-of-stock',
  }

  const work = (t) => scrape((page) => `https://www.${info.link}/${t}/page${page}.html`, info, selectors)
  switch (type) {
    case ItemType.rimfire:
      return work('store/category/1/4/rimfire-rifle-ammunition')

    case ItemType.centerfire:
      return Promise.all(
        ['store/category/1/2/centerfire-rifle-ammunition', 'store/category/1/3/handgun-ammunition'].map((t) =>
          throttle(() => work(t))
        )
      ).then(combineResults)

    case ItemType.shotgun:
      return Promise.all(['store/category/1/7/shotgun-ammunition'].map((t) => throttle(() => work(t)))).then(
        combineResults
      )
    case ItemType.case:
      return work('store/category/267/376/reloading')
    case ItemType.shot:
      return work('store/category/267/376/reloading')
    case ItemType.primer:
      return work('store/category/267/376/reloading')
    case ItemType.powder:
      return work('store/category/267/376/reloading')
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
