import axios from 'axios'

import cheerio = require('cheerio')
import * as helpers from '../helpers'
const SITE = 'https://www.tradeexcanada.com'
// 0 based list
async function work(page = 0) {
  await helpers.delayScrape(SITE)
  console.log(`loading page ${page} for tradex`)

  return axios.get(`${SITE}/produits/78?page=${page}`).then(r => {
    let $ = cheerio.load(r.data)
    const items = []
    $(
      '.views-view-grid .col-1, .views-view-grid .col-2, .views-view-grid .col-3, .views-view-grid .col-4'
    ).each((index, row) => {
      const result: any = {}
      const tha = $(row)

      result.link = SITE + tha.find('.views-field-title a').prop('href')
      result.img = tha.find('img').prop('src')
      result.name = tha.find('.views-field-body').text()
      const priceTxt = tha.find('.uc-price').text()
      result.price = parseFloat(priceTxt.replace('$', ''))
      result.vendor = 'Trade Ex Canada'
      result.province = 'ON'

      // div always present, empty if actually in stock
      if (
        tha
          .find('.uc_out_of_stock_html')
          .first()
          .text()
      ) {
        return
      }

      items.push(result)
    })

    if ($('.pager-last.last').length) {
      $ = null // dont hold onto page
      return work(page + 1).then(res => items.concat(res))
    } else {
      return items
    }
  })
}

export function tradex(type) {
  switch (type) {
    case 'centerfire':
    case 'shotgun':
    case 'rimfire':
      return work().then(items => helpers.classifyBullets(items, type))
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
