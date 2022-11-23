import * as helpers from '../../helpers'
import throat from 'throat'

import { Province, IItemListing, ItemType } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'
const throttle = throat(1)
export function reliablegun(type: ItemType): Promise<IItemListing[]|null> {
  const info: Info = {
    link: 'reliablegun.com',
    name: `Reliable Gun`,
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.item-box',
    name: '.product-title',
    img: '.picture img',
    link: '.picture a',
    price: '.price',
    nextPage: '.next-page',
    //outOfStock: '.out-of-stock',
  }
  const work = (t) =>
    scrape(
      (p) => `http://www.${info.link}/en/${t}?pageSize=96&viewMode=grid&orderBy=0&pageNumber=${p}`,
      info,
      selectors
    )

  switch (type) {
    case ItemType.rimfire:
      return work('rimfire-ammunition')

    case ItemType.centerfire:
      return Promise.all(['rifle-ammunition', 'hand-gun-ammunition'].map((f) => throttle(() => work(f)))).then(
        helpers.combineResults
      )
    case ItemType.shotgun:
      return work('shotgun-ammunition')
    case ItemType.primer:
      return work('primers')

    case ItemType.shot:
      return work('bullets')
    case ItemType.powder:
      return work('gun-powder')
    case ItemType.case:
      return work('brass')
    default:
      throw new Error(`unknown type: ${type}`)
  }
}
