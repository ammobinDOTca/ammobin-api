import throat from 'throat'

import * as helpers from '../../helpers'
import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'

import { PROPHET_RIVER } from '../../vendors'

export function prophetRiver(type: ItemType): Promise<IItemListing[]|null> {
  const throttle = throat(1)
  const info: Info = PROPHET_RIVER

  const selectors: Selectors = {
    item: '.ProductList li',
    name: '.ProductLink',
    img: 'img',
    link: 'a',
    price: '.ProductPrice',
    // nextPage: '.nav-links .next',
    // outOfStock: '.outofstock',
  }
  const work = (t) => scrape((p) => `https://${info.link}/${t}/`, info, selectors)

  switch (type) {
    case ItemType.rimfire:
      return Promise.all(
        [
          'cci',
          'eley-1',
          'federal',
          'hornady-2',
          'lapua-2',
          'remington-1',
          'sk',
          'winchester-1',
          'all-others-4',
        ].map((t) => throttle(() => work(t)))
      ).then(helpers.combineResults)
    case ItemType.centerfire:
      return Promise.all(
        [
          'barnes-1',
          'berger',
          'black-hills',
          'blazer-1',
          'buffalo-bore',
          'federal-1',
          'fiocchi-1',
          'gunwerks',
          'hornady-4',
          'hsm',
          'lapua-3',
          'lazzeroni-2',
          'ammunition/centerfire/nosler',
          'ppu',
          'remington-2',
          'sako-3',
          'weatherby-1',
          'winchester-2',
          'all-others-10',
        ].map((t) => throttle(() => work(t)))
      ).then(helpers.combineResults)

    case ItemType.shotgun:
      return Promise.all(
        ['federal-3', 'fiocchi', 'kent', 'remington-3', 'rst', 'winchester-3', 'all-others-11'].map((t) =>
          throttle(() => work(t))
        )
      ).then(helpers.combineResults)
    case ItemType.shot:
    case ItemType.primer:
    case ItemType.case:
    case ItemType.powder:
      return Promise.resolve(null) // todo: they have reloading but i dont have the desire
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
