import axios from 'axios'
import cheerio = require('cheerio')
import * as helpers from '../helpers'
import throat from 'throat'

function work(type, page = 1) {
  console.log(`loading northpro ${type} ${page}`)
  return axios
    .get(
      `http://northprosports.com/index.php?route=product/category&path=766_${type}&limit=250`
    )
    .then(r => {
      const $ = cheerio.load(r.data)
      const items = []
      $('.product-list div').each((index, row) => {
        const result: any = {}
        const tha = $(row)

        result.link = tha.find('.image a').prop('href')
        result.img = tha.find('.image img').prop('src')
        result.name = tha.find('.image img').prop('title')
        let priceTxt = tha.find('.price').text()

        if (tha.find('.price .price-new').text().length > 0) {
          priceTxt = tha.find('.price .price-new').text()
        }
        result.price = parseFloat(priceTxt.replace('$', ''))
        result.vendor = 'North Pro Sports'
        result.province = 'SK'
        if (result.name && !isNaN(result.price) && result.price > 0) {
          items.push(result)
        }
      })

      // if ($('.pagination-item-next-link').length) {
      //   $ = null; // dont hold onto page for recursion
      //   return work(type, page + 1)
      //     .then(results => items.concat(results));
      // } else {
      return items
      // }
    })
}
export function northpro(type) {
  const throttle = throat(1)

  switch (type) {
    case 'rimfire':
      return work('1050', 1)

    case 'centerfire':
      return Promise.all(
        ['976', '964'].map(t => throttle(() => work(t, 1)))
      ).then(helpers.combineResults)

    case 'shotgun':
      return work('863', 1)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
