import axios from 'axios'

import cheerio from 'cheerio'
import * as helpers from '../helpers'
import throat from 'throat'
import { AmmoType, IAmmoListing, Province } from '../graphql-types'

const SITE = 'https://alflahertys.com'

async function work(type: string, page = 1): Promise<IAmmoListing[]> {
  await helpers.delayScrape(SITE)
  console.log(`loading al flahertys ${type} ${page}`)

  return axios.get(`${SITE}/${type}?page=${page}`).then(r => {
    let $ = cheerio.load(r.data)
    const items = []
    $('.product .card').each((index, row) => {
      const result: any = {}
      const tha = $(row)

      if (tha.find('.out-of-stock').length > 0) {
        return
      }
      result.link = tha.find('.card-title a').prop('href')
      result.img = tha.find('.card-image').prop('src')
      result.name = tha
        .find('.card-title')
        .text()
        .trim()
      const priceTxt = tha
        .find('.price')
        .last()
        .text() // sale price come last...
      result.price = parseFloat(priceTxt.replace('$', ''))

      result.vendor = 'Al Flaherty'
      result.province = 'ON'
      result.provinces = [Province.ON]

      items.push(result)
    })

    if ($('.pagination-item--next').length > 0) {
      $ = null // dont hold onto page for recursion
      return work(type, page + 1).then(results => items.concat(results))
    } else {
      return items
    }
  })
}

export function alflahertys(type: AmmoType): Promise<IAmmoListing[]> {
  const throttle = throat(1)

  switch (type) {
    case AmmoType.rimfire:
      return work(
        'shooting-supplies-and-firearms/ammunition/rimfire-ammunition'
      ).then(helpers.classifyRimfire)

    case AmmoType.centerfire:
      return Promise.all(
        [
          'shooting-supplies-and-firearms/ammunition/bulk-centerfire',
          'centerfire-ammo',
        ].map(t => throttle(() => work(t, 1)))
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)

    case AmmoType.shotgun:
      return work(
        'shooting-supplies-and-firearms/ammunition/shotgun-ammunition'
      ).then(helpers.classifyShotgun)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
