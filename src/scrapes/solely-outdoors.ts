import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'
import { combineResults } from '../helpers'
import throat from 'throat'
const throttle = throat(1)

export function solelyOutdoors(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    link: 'solelyoutdoors.com',
    name: `Soley Outdoors`,
    provinces: [Province.ON],
  }

  const selectors: Selectors = {
    item: '.product-block',
    name: '.with-brand',
    img: 'img',
    link: 'a',
    price: '.product-block-price',
    nextPage: '.load-more',
    outOfStock: '.out-of-stock',
  }

  const work = (t) => scrape((p) => `https://www.solelyoutdoors.com/${t}/page${p}.html`, info, selectors)
  switch (type) {
    case ItemType.rimfire:
      return work('ammunition/rimfire')

    case ItemType.centerfire:
      return Promise.all(
        ['handgun-ammo', 'rifle-ammo', 'bulk-ammo'].map((t) => throttle(() => work('ammunition/' + t)))
      ).then(combineResults)
    case ItemType.shotgun:
      return Promise.all(['shotgun-ammo', 'bulk-ammo'].map((t) => throttle(() => work('ammunition/' + t)))).then(
        combineResults
      )
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
