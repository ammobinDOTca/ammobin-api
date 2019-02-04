import axios from 'axios'
import cheerio = require('cheerio')
import * as helpers from '../helpers'
const SITE = 'https://store.theshootingcentre.com'

async function work(page = 1) {
  await helpers.delayScrape(SITE)

  console.log(`loading theShootingCenter ${page}`)
  return axios.get(`${SITE}/collections/ammunition?page=${page}`).then(r => {
    let $ = cheerio.load(r.data)
    const items = []
    $(
      '.grid-uniform .large--one-quarter.medium--one-third.small--one-half'
    ).each((index, row) => {
      const result: any = {}
      const tha = $(row)
      result.link = SITE + tha.find('.product-grid-item').prop('href')
      result.img = tha.find('img').prop('src')
      if (result.img && result.img.indexOf('no-image') >= 0) {
        result.img = null
      }
      result.name = tha.find('p').text()
      const priceTxt = tha.find('.product-item--price').text()
      result.price = parseFloat(priceTxt.replace('$', '')) / 100 // every price is in 2 parts

      result.vendor = 'Calgary Shooting Center'
      result.province = 'AB'

      items.push(result)
    })

    if (items.length === 20) {
      // just assumes 20 items per page
      $ = null // dont hold onto page for recursion
      return work(page + 1).then(results => items.concat(results))
    } else {
      return items
    }
  })
}

export function theShootingCenter(type) {
  switch (type) {
    case 'rimfire':
    case 'centerfire':
    case 'shotgun':
      return work().then(items => helpers.classifyBullets(items, type))
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
