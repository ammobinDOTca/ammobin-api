// https://gun-shop.ca/product-category/ammunition/bulk-ammo/?orderby=price&count=100
import axios from 'axios'

import cheerio = require('cheerio')
import * as helpers from '../helpers'

function fn(type, page = 1) {
  return axios
    .get(
      `https://gun-shop.ca/product-category/ammunition/${type}/page/${page}/?orderby=price-desc`
    )
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = []
      $('.product').each((index, row) => {
        const result: any = {}
        const tha = $(row)

        if (tha.find('.out-of-stock-label').length > 0) {
          return
        }

        result.link = tha.find('a').prop('href')
        result.img = 'https:' + tha.find('.wp-post-image').prop('src')
        result.name = tha.find('.product-title').text()

        // on sale price comes last
        result.price = parseFloat(
          tha
            .find('.amount')
            .last()
            .text()
            .replace('$', '')
        )

        result.vendor = 'Wild West'
        result.province = 'AB'
        items.push(result)
      })

      const paginationContainer = $('.woocommerce-pagination')
      const TODO = false // 20180517: dont want to figure this out tonight
      if (paginationContainer.length > 0 && TODO) {
        $ = null
        console.log(`loading wild west page ${page + 1}`)
        return fn(type, page + 1).then(f => items.concat(f))
      } else {
        return items
      }
    })
}

export function wildWest(type) {
  switch (type) {
    case 'rimfire':
    case 'centerfire':
      return Promise.all([fn('bulk-ammo'), fn('box-ammo')])
        .then(results => results.reduce((final, r) => final.concat(r), []))
        .then(i => helpers.classifyBullets(i, type))
    case 'shotgun':
      return fn('shotgun-ammo').then(helpers.classifyShotgun)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
