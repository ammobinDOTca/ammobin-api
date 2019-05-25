import axios from 'axios'
import cheerio = require('cheerio')
import * as helpers from '../helpers'
import throat from 'throat'

async function work(type, page = 1) {
  await helpers.delayScrape('https://www.nasgunsandammo.com')
  console.log(`loading nasgunsandammo ${type} ${page}`)

  return axios
    .get(
      `https://www.nasgunsandammo.com/product-category/ammo/${type}/page/${page}/`
    )
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = []
      $('.product').each((index, row) => {
        const result: any = {}
        const tha = $(row)

        if (tha.prop('class').indexOf('outofstock') >= 0) {
          return
        }

        result.link = tha.find('.woocommerce-LoopProduct-link').prop('href')
        result.img = tha.find('.kw-prodimage-img').prop('src')
        result.name = tha.find('.kw-details-title').text()
        const priceTxt = tha.find('.price').text()
        result.price = parseFloat(priceTxt.replace('$', ''))
        result.vendor = 'NAS Guns & Ammo'
        result.province = 'ON'

        items.push(result)
      })

      if ($('.pagination-item-next-link').length) {
        $ = null // dont hold onto page for recursion
        return work(type, page + 1).then(results => items.concat(results))
      } else {
        return items
      }
    })
}

export function nas(type) {
  const throttle = throat(1)

  switch (type) {
    case 'rimfire':
      return work('rimfire', 1)

    case 'centerfire':
      return Promise.all(
        [
          'centrefire', // look at these fancy fellows...
          'surplus-ammo',
        ].map(t => throttle(() => work(t, 1)))
      ).then(helpers.combineResults)

    case 'shotgun':
      return work('shotgun', 1)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
