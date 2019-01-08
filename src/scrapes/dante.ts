import axios from 'axios'
import cheerio = require('cheerio')
import * as helpers from '../helpers'
import { AmmoType, IAmmoListing } from '../graphql-types'
function work(type): Promise<IAmmoListing[]> {
  console.log(`loading dante ${type}`)
  return axios
    .get(
      `https://www.dantesports.com/en/product-category/shop/ammunition/${type}/?product_count=100`
    )
    .then(r => {
      const $ = cheerio.load(r.data)
      const items = []
      $('.product').each((index, row) => {
        const result: any = {}
        const tha = $(row)

        if (tha.prop('class').indexOf('outofstock') >= 0) {
          return
        }

        result.link = tha.find('.woocommerce-LoopProduct-link').prop('href')
        result.img = tha.find('.wp-post-image').prop('src')
        result.name = tha.find('.woocommerce-loop-product__title').text()
        const priceTxt = tha.find('.woocommerce-Price-amount').text()
        result.price = parseFloat(priceTxt.replace('$', ''))
        result.vendor = 'Dante'
        result.province = 'QC'

        items.push(result)
      })
      return items
    })
}
export function dante(type: AmmoType): Promise<IAmmoListing[]> {
  switch (type) {
    case AmmoType.rimfire:
      return work('rimfire').then(helpers.classifyRimfire)

    case AmmoType.centerfire:
      return work('centerfire').then(helpers.classifyCenterfire)

    case AmmoType.shotgun:
      return work('shotshells').then(helpers.classifyShotgun)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
