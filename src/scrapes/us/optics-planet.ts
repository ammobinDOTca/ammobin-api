// TODO https://www.natchezss.com/affiliates

import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'
import { OPTICS_PLANET } from '../../vendors-us'

import throat from 'throat'

import { combineResults } from '../../helpers'
const throttle = throat(1)

export function OpticsPlanet(type: ItemType): Promise<IItemListing[]> {
  const selectors: Selectors = {
    item: '.product',
    name: '.grid__text',
    img: 'img',
    link: 'a',
    price: '.grid__price',
    pricePerRound: '.grid__save-text',
    nextPage: '.e-pagination__btn_next',
  }

  const work = (t) =>
    scrape(
      (p) => `https://www.${OPTICS_PLANET.link}/${t}.html?_iv_availability=in-stock&_iv_gridSize=240&_iv_page=${p}`,
      OPTICS_PLANET,
      selectors
    )
  switch (type) {
    case ItemType.rimfire:
      return work('rimfire-ammo')
    case ItemType.centerfire:
      return Promise.all(['handgun-ammo', 'rifle-ammo'].map((t) => throttle(() => work(t)))).then(combineResults)

    case ItemType.shotgun:
      return work('shotgun-ammo')

    case ItemType.primer:
    case ItemType.case:
    case ItemType.shot:
    case ItemType.powder:
      return Promise.resolve(null) // TODO
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
