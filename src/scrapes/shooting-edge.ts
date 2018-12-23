import axios from 'axios'
import cheerio = require('cheerio')
import * as helpers from '../helpers'
const SITE = 'https://theshootingedge.com'

async function fn(section, type, page = 1) {
  await helpers.delayScrape(SITE)

  return axios.get(`${SITE}/collections/ammunition-1?page=${page}`).then(r => {
    let $ = cheerio.load(r.data)
    const items = []
    $('.product-card').each((index, row) => {
      const result: any = {}
      const tha = $(row)
      if (tha.find('.product-card__availability').length) {
        return
      }

      result.link = SITE + tha.prop('href')
      result.img = 'https:' + tha.find('.product-card__image').prop('src')

      result.name = tha.find('.product-card__name').text()
      result.price = parseFloat(
        tha
          .find('.product-card__price')
          .text()
          .replace('$', '')
      )
      result.vendor = 'The Shooting Edge'
      result.province = 'AB'
      items.push(result)
    })

    if ($('.next').length > 0 && items.length > 0) {
      // load next page
      $ = null // dont hold onto current page
      console.log('loading theshootingedge page', page + 1)
      return fn(section, type, page + 1).then(ff => ff.concat(items))
    } else {
      return items
    }
  })
}

export function shootingEdge(type) {
  switch (type) {
    case 'rimfire':
    case 'centerfire':
    case 'shotgun':
      return fn(``, type).then(i => helpers.classifyBullets(i, type))

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
