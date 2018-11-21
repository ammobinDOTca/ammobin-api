const axios = require('axios')
const cheerio = require('cheerio')
const helpers = require('../helpers')
const throat = require('throat')
const SITE = 'https://www.wanstallsonline.com'
async function getStuff(type) {
  await helpers.delayScrape(SITE)

  const r = await axios.get(`${SITE}/ammunition/${type}.html?limit=all`)
  const $ = cheerio.load(r.data)
  const items = []
  $('.product-box-1').each((index, row) => {
    const result = {}
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

function wanstalls(type) {
  switch (type) {
    case 'rimfire':
      return getStuff('rimfire').then(helpers.classifyRimfire)

    case 'shotgun':
      return getStuff('shotgun').then(helpers.classifyShotgun)

    case 'centerfire':
      return Promise.all(
        ['pistol', 'rifle', 'surplus'].map(t => throttle(() => getStuff(t, 1)))
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}

module.exports = wanstalls
