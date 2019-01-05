import axios from 'axios'
import cheerio = require('cheerio')
import * as helpers from '../helpers'
import throat = require('throat')

async function work(type, page = 1) {
  await helpers.delayScrape('https://leverarms.com')

  console.log(`loading lever arms ${type} ${page}`)
  return axios
    .get(`https://leverarms.com/product-category/${type}/page/${page}`)
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = []
      $('.product').each((index, row) => {
        const tha = $(row)

        if (tha.prop('class').indexOf('outofstock') >= 0) {
          return
        }

        const result: any = {}
        result.link = tha.find('.woocommerce-LoopProduct-link').prop('href')
        result.img = tha.find('img').prop('src')
        result.name = tha.find('.woocommerce-loop-product__title').text()
        const priceTxt = tha.find('.woocommerce-Price-amount').text()
        result.price = parseFloat(priceTxt.replace('$', ''))
        result.vendor = 'Lever Arms'
        result.province = 'BC'

        items.push(result)
      })

      if ($('.nav-links .next').length) {
        $ = null // dont hold onto page for recursion
        return work(type, page + 1).then(results => items.concat(results))
      } else {
        return items
      }
    })
}
export function leverarms(type) {
  const throttle = throat(1)

  switch (type) {
    case 'rimfire':
      return work('rimfire-ammo', 1).then(helpers.classifyRimfire)

    case 'centerfire':
      return Promise.all(
        [
          'rifle-ammunition',
          // 'pistol-ammunition',
        ].map(t => throttle(() => work(t, 1)))
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)

    case 'shotgun':
      return work('shotgun-shells', 1).then(helpers.classifyShotgun)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
