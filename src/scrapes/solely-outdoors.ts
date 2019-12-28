import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'

export function solelyOutdoors(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    link: 'solelyoutdoors.com',
    name: `Soley Outdoors`,
    provinces: [Province.ON],
  }

  const selectors: Selectors = {
    item: '.product ',
    name: '.fulltitle',
    img: '.image-wrap img',
    link: '.image-wrap a',
    price: '.price-new',
    nextPage: '.next.enabled',
    outOfStock: '.out-of-stock',
  }

  const work = t => scrape(p => `https://www.solelyoutdoors.com/${t}/page${p}.html`, info, selectors)
  switch (type) {
    case ItemType.rimfire:
      return work('ammunition/rimfire')

    case ItemType.centerfire:
      return work('ammunition/centerfire')

    case ItemType.shotgun:
      return work('ammunition/shotgun')
    case ItemType.primer:
      return work('reloading/primers')
    case ItemType.case:
      return work('reloading/brass')
    case ItemType.shot:
      return work('reloading/bullets-projectiles')
    case ItemType.powder:
      return work('reloading/powders')
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
