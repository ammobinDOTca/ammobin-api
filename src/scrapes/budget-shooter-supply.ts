import * as helpers from '../helpers'
import { AmmoType, IAmmoListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'
import throat from 'throat'

export function budgetShooterSupply(type: AmmoType): Promise<IAmmoListing[]> {
  const info: Info = {
    site: 'budgetshootersupply.ca',
    vendor: `Budget Shooter Supply`,
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.product',
    name: '.woocommerce-loop-product__title',
    img: '.attachment-woocommerce_thumbnail',
    link: 'a',
    price: '.price',

    nextPage: '.next',
  }
  const throttle = throat(1)

  const BASE = `https://www.${
    info.site
  }/product-category/categories/ammunition/`
  switch (type) {
    case AmmoType.centerfire:
      return Promise.all(
        ['pistol', 'rifle'].map(t =>
          throttle(() =>
            scrape(
              p => `${BASE}/centerfire-${t}-ammunition/page/${p}`,
              info,
              selectors
            )
          )
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)
    case AmmoType.shotgun:
      return Promise.all(
        ['410-gauge-shotgun', '12-gauge-buckshot'].map(t =>
          throttle(() =>
            scrape(p => `${BASE}/${t}-ammo/page/${p}`, info, selectors)
          )
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classifyShotgun)
    case AmmoType.rimfire:
      return scrape(
        p => `${BASE}/rimfire-ammunition/page/${p}`,
        info,
        selectors
      ).then(helpers.classifyRimfire)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
