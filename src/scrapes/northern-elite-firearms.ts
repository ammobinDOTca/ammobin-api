import throat = require('throat')
import { scrape, Info, Selectors } from './common'
import * as helpers from '../helpers'
import { AmmoType, IAmmoListing, Province } from '../graphql-types'

export function northernEliteFirearms(type: AmmoType): Promise<IAmmoListing[]> {
  const throttle = throat(1)
  const info: Info = {
    site: 'northernelitefirearms.ca',
    vendor: 'Northern Elite Firearms',
    provinces: [Province.SK],
  }

  const selectors: Selectors = {
    item: '.product',
    name: '.product-title',
    img: '.attachment-woocommerce_thumbnail',
    link: '.product-title a',
    price: '.price',
    nextPage: '.next',
  }

  const BASE = 'https://www.northernelitefirearms.ca/product-category'
  switch (type) {
    case AmmoType.rimfire:
      return scrape(
        p => `${BASE}/ammunition-rim-fire/page/${p}`,
        info,
        selectors
      ).then(items => helpers.classifyRimfire(items))

    case 'centerfire':
      return Promise.all(
        ['hand-guns', 'rifles', ''].map(t =>
          throttle(() =>
            scrape(p => `${BASE}/ammunition-${t}/page/${p}`, info, selectors)
          )
        )
      )
        .then(helpers.combineResults)
        .then(items => helpers.classifyCenterfire(items))

    case 'shotgun':
      return scrape(
        p => `${BASE}/ammunition-shot-gun/page/${p}`,
        info,
        selectors
      ).then(items => helpers.classifyShotgun(items))

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
