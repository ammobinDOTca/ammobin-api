import * as helpers from '../helpers'
import throat from 'throat'
import { ItemType, IItemListing, Province } from '../graphql-types'
import { Info, Selectors, scrape } from './common'

function work(path: String) {
  const info: Info = {
    site: 'bartonsbigcountry.ca',
    vendor: `Bartons Big Country`,
    provinces: [Province.AB],
  }

  const selectors: Selectors = {
    item: '.product-item-info',
    name: '.product-item-link',
    img: '.product-image-photo',
    link: '.product-item-link',
    price: '.price',

    nextPage: '.pages-item-next',
  }
  const BASE = 'https://' + info.site
  return scrape(
    p => `${BASE}/index.php/${path}.html?product_list_limit=30&p=${p}`,
    info,
    selectors
  )
}

export function barton(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)

  switch (type) {
    case ItemType.rimfire:
      return work('ammunition/rimfire').then(helpers.classifyRimfire)

    case ItemType.centerfire:
      return Promise.all(
        ['centerfire-pistol', 'centerfire-rifle', 'bulk-surplus'].map(t =>
          throttle(() => work('ammunition/' + t))
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)
    case ItemType.shotgun:
      return work('ammunition/shotgun-ammunition').then(helpers.classifyShotgun)

    case ItemType.shot:
      return work('reloading/bullets')
    case ItemType.case:
      return work('reloading/brass')
    case ItemType.powder:
      return work('reloading/powder')
    case ItemType.primer:
      return Promise.resolve([]) // no results as of 20190511
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
