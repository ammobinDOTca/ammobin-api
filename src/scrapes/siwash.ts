import axios from 'axios'

import cheerio from 'cheerio'
import * as helpers from '../helpers'
import throat from 'throat'
import { ItemType, IItemListing, Province } from '../graphql-types'

const SITE = 'https://www.siwashsports.ca'

async function work(type: string, page = 1): Promise<IItemListing[]> {
  await helpers.delayScrape(SITE)
  console.log(`loading al siwash sports ${type} ${page}`)

  return axios.get(`${SITE}/product-category/${type}?page=${page}`).then(r => {
    let $ = cheerio.load(r.data)
    const items = []
    $('.product').each((index, row) => {
      const result: any = {}
      const tha = $(row)

      result.link = tha.find('a').prop('href')
      result.img = tha.find('.wp-post-image').prop('src')
      result.name = tha
        .find('.woocommerce-loop-product__title')
        .text()
        .trim()
      const priceTxt = tha
        .find('.amount')
        .last()
        .text() // sale price come last...
      result.price = parseFloat(priceTxt.replace('$', ''))

      result.vendor = 'Siwash Sports'
      result.provinces = [Province.BC]

      items.push(result)
    })

    return items
  })
}

export function siwashSports(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)

  switch (type) {
    case ItemType.rimfire:
      return work('ammunition/rimfire-ammunition').then(helpers.classifyRimfire)

    case ItemType.centerfire:
      return Promise.all(
        ['ammunition/centerfire-ammunition', 'surplus/surplus-ammunition'].map(
          t => throttle(() => work(t, 1))
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)

    case ItemType.shotgun:
      return work('ammunition/shotgun-ammunition').then(helpers.classifyShotgun)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
