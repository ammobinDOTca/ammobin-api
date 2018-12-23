import axios from 'axios'

import cheerio = require('cheerio')
import * as helpers from '../helpers'
import throat = require('throat')
const SITE = 'https://www.wanstallsonline.com'

async function getStuff(type) {
  await helpers.delayScrape(SITE)

  const r = await axios.get(`${SITE}/ammunition/${type}.html?limit=all`)
  const $ = cheerio.load(r.data)
  const items = []
  $('.product-box-1').each((index, row) => {
    const result: any = {}
    const tha = $(row)

    result.link = tha.find('.product-image').prop('href')
    result.img = tha.find('.product-image img').prop('src')

    result.name = tha.find('.product-name').text()

    const salePrice = parseFloat(
      tha
        .find('.special-price .price')
        .text()
        .replace('$', '')
    )
    const regPrice = parseFloat(
      tha
        .find('.price-box .price')
        .text()
        .replace('$', '')
    )
    result.price = isFinite(salePrice) && salePrice > 0 ? salePrice : regPrice

    result.vendor = 'Wanstalls'
    result.province = 'BC'
    items.push(result)
  })

  return items
}

const throttle = throat(1)

export function wanstalls(type) {
  switch (type) {
    case 'rimfire':
      return getStuff('rimfire').then(helpers.classifyRimfire)

    case 'shotgun':
      return getStuff('shotgun').then(helpers.classifyShotgun)

    case 'centerfire':
      return Promise.all(
        ['pistol', 'rifle', 'surplus'].map(t => throttle(() => getStuff(t)))
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
