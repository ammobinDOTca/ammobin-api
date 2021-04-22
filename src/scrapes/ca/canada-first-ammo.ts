import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'
import { combineResults } from '../../helpers'
import throat from 'throat'
import { CANADA_FIRST_AMMO } from '../../vendors'
// import { RENDERTRON_URL } from '../../constants'

export function canadaFirstAmmo(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info = CANADA_FIRST_AMMO

  const selectors: Selectors = {
    item: '.product', //'.snize-product',
    name: '.card-title', //'.snize-title',
    img: 'amp-img', //'img',
    link: 'a',
    price: '.price', //'.snize-price',
    // brand: '.snize-attribute-title',
  }

  const work = (t) =>
    scrape(
      // (page) => `${RENDERTRON_URL}/render/https://${info.link}/ammunition/${t}/?page=${page}&rb_stock_status=In+stock`,
      (page) => `https://${info.link}/amp/ammunition/${t}/?page=${page}&rb_stock_status=In+stock`,
      info,
      selectors
    )
  switch (type) {
    case ItemType.rimfire:
      return work('rifle/rimfire')

    case ItemType.centerfire:
      return Promise.all(['rifle', 'pistol'].map((t) => throttle(() => work(t)))).then(combineResults)

    case ItemType.shotgun:
      return work('shotgun')
    case ItemType.case:
    case ItemType.shot:
    case ItemType.primer:
    case ItemType.powder:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
