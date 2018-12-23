import axios from 'axios'
import cheerio = require('cheerio')
import * as helpers from '../helpers'
import throat = require('throat')

async function fn(type, page = 1) {
  await helpers.delayScrape('http://www.tigerarms.ca')

  return axios
    .get(
      `http://www.tigerarms.ca/product-category/ammunition/${type}/page/${page}/`
    )
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = []
      $('.product-inner').each((index, row) => {
        const result: any = {}
        const tha = $(row)
        if (tha.find('.gema75_soldout_badge_new_2327').length) {
          return
        }

        result.link = tha.find('.woocommerce-LoopProduct-link').prop('href')
        result.img = tha.find('.attachment-shop_catalog').prop('src')
        result.name = tha.find('.product-info h3').text()
        result.price = parseFloat(
          tha
            .find('.amount')
            .text()
            .replace('$', '')
        )
        result.vendor = 'Tiger Arms'
        result.province = 'BC'
        items.push(result)
      })

      if ($('.fa-angle-right').length) {
        // load next page
        $ = null // dont hold onto current page
        console.log('loading tiger arms page', page + 1)
        return fn(type, page + 1).then(ff => ff.concat(items))
      } else {
        return items
      }
    })
}

export function tigerArms(type) {
  const throttle = throat(1)
  switch (type) {
    case 'rimfire':
      return fn('rifle-ammo').then(i => helpers.classifyBullets(i, type))

    case 'centerfire':
      return Promise.all([
        throttle(() => fn('handgun-ammo')),
        throttle(() => fn('rifle-ammo')),
      ])
        .then(helpers.combineResults)
        .then(i => helpers.classifyBullets(i, type))

    case 'shotgun':
      return fn('shotgun-ammo').then(helpers.classifyShotgun)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
