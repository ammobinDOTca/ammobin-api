import * as helpers from '../../helpers'
import { Province, IItemListing, ItemType } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'
import throat from 'throat'

export function jobrook(type: ItemType): Promise<IItemListing[]|null> {
  const throttle = throat(1)

  const info: Info = {
    link: 'jobrookoutdoors.com',
    name: `Jo Brook Outdoors`,
    provinces: [Province.MB],
  }

  const selectors: Selectors = {
    item: '.product ',
    name: '.product-detail h3',
    img: '.product-image img',
    link: '.product-image a',
    price: '.price',
    nextPage: '.next',
    outOfStock: '.out-of-stock',
  }
  function work(f) {
    return scrape((p) => `http://www.${info.link}/hunt/${f}/page${p}.html`, info, selectors)
  }

  switch (type) {
    case ItemType.rimfire:
      return work('ammo/rimfire')

    case ItemType.centerfire:
      return Promise.all(['rifle', 'pistol' /*, 'bulk'*/].map((t) => throttle(() => work('ammo/' + t)))).then(
        helpers.combineResults
      )

    case ItemType.shotgun:
      return work('ammo/shotgun')
    case ItemType.case:
      return work('reloading/brass')
    case ItemType.powder:
      return work('reloading/powder')
    case ItemType.shot:
      return work('reloading/bullets')
    case ItemType.primer:
      return work('reloading/primers')
    default:
      throw new Error(`unknown type ${type}`)
  }
}
