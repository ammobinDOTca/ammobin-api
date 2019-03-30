import * as helpers from '../helpers'
import throat from 'throat'
import { AmmoType, IAmmoListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'

export function rampart(type: AmmoType): Promise<IAmmoListing[]> {
  const throttle = throat(1)
  const info: Info = {
    site: 'rampartcorp.com',
    vendor: 'Rampart',
    provinces: [Province.ON],
  }
  const selectors: Selectors = {
    item: '.product',
    name: '.card-title',
    img: '', // '.card-image', // disabled since images load async
    link: '.card-figure a',
    price: '.price',
  }
  switch (type) {
    case AmmoType.centerfire:
      return Promise.all(
        ['rifle', 'pistol'].map(t =>
          throttle(() =>
            scrape(
              page =>
                `https://rampartcorp.com/firearms/ammunition/${t}-calibers/`,
              info,
              selectors
            )
          )
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)

    case AmmoType.shotgun:
    case AmmoType.rimfire:
      return Promise.resolve([]) // 20190324: not selling rimfire or shotgun.
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
