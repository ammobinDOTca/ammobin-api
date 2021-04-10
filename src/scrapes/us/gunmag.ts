import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'
import { GUNMAG } from '../../vendors-us'

export function gunmag(type: ItemType): Promise<IItemListing[]> {
  const selectors: Selectors = {
    item: '.item',
    name: '.product-name',
    img: 'img',
    link: 'a',
    price: '.price', // they also have a low price
    // nextPage: '.next', // todo
    // outOfStock: '.card-bulkOrder-action [data-event-type="product-click"]', // handled by url
  }
  //
  const work = (t) => scrape((p) => `https://${GUNMAG.link}/ammunition?stock=1`, GUNMAG, selectors)
  switch (type) {
    case ItemType.rimfire:
    case ItemType.centerfire:
    case ItemType.shotgun:
      return work('')

    case ItemType.primer:
    case ItemType.case:
    case ItemType.shot:
    case ItemType.powder:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
