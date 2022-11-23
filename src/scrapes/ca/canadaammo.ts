import { combineResults } from '../../helpers'
import { ItemType, IItemListing, Province } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'

function work(path: String) {
  const info: Info = {
    link: 'canadaammo.com',
    name: `Canada Ammo`,
    provinces: [Province.BC, Province.ON],
  }

  const selectors: Selectors = {
    item: '.product__product',
    name: '.product__name',
    img: '.product__image img',
    link: '.product__button.product__button--left a',
    price: '.product__price',
  }

  return scrape(
    (p) => `https://www.${info.link}/product/byCategory/${path}/?page=${p}&status=instock&count=72`,
    info,
    selectors
  )
}

export function canadaammo(type: ItemType): Promise<IItemListing[]|null> {
  switch (type) {
    case ItemType.rimfire:
    case ItemType.case:
      return Promise.resolve(null)
    case ItemType.centerfire:
      return Promise.all([work('rifle-ammo'), work('handgun-ammo')]).then(combineResults)
    case ItemType.shotgun:
      return work('shotgun-ammo')
    case ItemType.powder:
      return work('smokeless-powder')
    case ItemType.shot:
      return work('projectiles')
    case ItemType.primer:
      return work('primers')
    default:
      throw new Error('Unknown type: ' + type)
  }
}
