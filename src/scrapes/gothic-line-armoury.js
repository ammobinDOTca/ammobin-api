const axios = require('axios')
const cheerio = require('cheerio')
const helpers = require('../helpers')

async function work(type = 'doesnt matter', page = 1) {
  const domain = 'https://gothiclinearmoury.ca'
  await helpers.delayScrape(domain)
  console.log(`loading ${domain}  ${type} ${page}`)

  return axios.get(`${domain}/product-category/ammunition`).then(r => {
    const $ = cheerio.load(r.data)
    const items = []
    $('.product').each((index, row) => {
      const result = {}
      const tha = $(row)

      result.link = tha.find('a').prop('href')
      result.img = tha.find('img').prop('src')
      result.name = tha.find('.woocommerce-loop-product__title').text()
      const priceTxt = tha
        .find('.amount')
        .last()
        .text()
      result.price = parseFloat(priceTxt.replace('$', '')) / 100
      result.vendor = 'Gothic Line Armoury'
      result.province = 'AB'

      items.push(result)
    })
    return items
  })
}

function lanz(type) {
  switch (type) {
    case 'rimfire':
    case 'shotgun':
      return Promise.resolve([])

    case 'centerfire':
      return work().then(helpers.classifyCenterfire)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}

module.exports = lanz
