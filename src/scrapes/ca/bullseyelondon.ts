import { ItemType, IItemListing } from '../../graphql-types'
import { Selectors, scrape } from '../common'
import { BULLS_EYE } from '../../vendors'

function work(path: String): Promise<IItemListing[]|null> {
  const selectors: Selectors = {
    item: '.productListing',
    name: '.name',
    img: 'img',
    link: 'a',
    price: '.itemPrice',
  }
  const BASE = 'https://www.' + BULLS_EYE.link
  return scrape((p) => `${BASE}/${path}/browse/perpage/999`, BULLS_EYE, selectors)
}

export function bullseyelondon(type: ItemType): Promise<IItemListing[]|null> {
  switch (type) {
    case ItemType.rimfire:
      return work('ammunition-rimfire')
    case ItemType.centerfire:
      return work('ammunition-centerfire')
    case ItemType.shotgun:
      return work('ammunition-shotgun')
    case ItemType.shot:
      return work('reloading-bullets')
    case ItemType.case:
      return work('reloading-brass')
    case ItemType.powder:
      return work('reloading-powder')
    case ItemType.primer:
      return work('reloading-primers')
    default:
      throw new Error(`unknown type: ${type}`)
  }
}
