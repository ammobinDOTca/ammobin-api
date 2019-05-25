import axios from 'axios'
import cheerio = require('cheerio')
import * as helpers from '../helpers'
import throat from 'throat'

async function work(type, page = 1) {
  await helpers.delayScrape('http://www.lanzshootingsupplies.com')
  console.log(`loading  lanz ${type} ${page}`)

  return axios
    .get(
      `http://www.lanzshootingsupplies.com/shop/ammunition/${type}/page${page}.html?limit=50`
    )
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = []
      $('.product-block-inner').each((index, row) => {
        const result: any = {}
        const tha = $(row)

        result.link = tha.find('a').prop('href')
        result.img = tha.find('img').prop('src')
        result.name = tha.find('h3 a').prop('title')
        const priceTxt = tha.find('.price').text()
        result.price = parseFloat(priceTxt.replace('C$', ''))
        result.vendor = 'Lanz Shooting Supplies'
        result.province = 'ON'

        items.push(result)
      })

      if ($('.next a').length) {
        $ = null // dont hold onto page for recursion
        return work(type, page + 1).then(results => items.concat(results))
      } else {
        return items
      }
    })
}

export function lanz(type) {
  const throttle = throat(1)

  switch (type) {
    case 'rimfire':
      return work('rimfire-ammunition', 1)

    case 'centerfire':
      return Promise.all(
        ['handgun-ammunition', 'rifle-ammunition', 'bulk-ammunition'].map(t =>
          throttle(() => work(t, 1))
        )
      ).then(helpers.combineResults)

    case 'shotgun':
      return work('shotgun-ammunition', 1)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
