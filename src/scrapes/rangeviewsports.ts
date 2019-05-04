import axios from 'axios'
import cheerio = require('cheerio')
import * as helpers from '../helpers'
import { Province, AmmoType } from '../graphql-types'
// https://www.rangeviewcanada.com/product-category/ammunition/page/
const URL = 'https://www.rangeviewcanada.com'

async function fn(page: number = 1): Promise<any[]> {
  console.log('rangeviewsports', page)
  await helpers.delayScrape(URL)

  return axios
    .get(
      `${URL}/product-category/ammo/page/${page}?sort_by=best-selling&pagesize=60`,
      {
        headers: {
          cookie: 'woocommerce_products_per_page=60',
        },
      }
    )
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = []
      $('.product.purchasable').each((index, row) => {
        const result: any = {}
        const tha = $(row)

        result.name = tha.find('.gridview .product-name a').text()

        result.link = tha.find('.woocommerce-loop-product__link').prop('href')
        if (tha.find('.badge--sold-out').length) {
          return
        }

        result.img = tha.find('img').prop('src')

        const priceTxt = tha.find('.price-box').text()

        result.price = parseFloat(priceTxt.trim().replace('$', '')) // account for everything be x.99

        result.vendor = 'Rangeview Sports'
        result.province = 'ON'
        result.provinces = [Province.ON]

        items.push(result)
      })

      const hasMorePages = $('.page-numbers .next').length > 0

      if (hasMorePages) {
        $ = null
        return fn(page + 1).then(res => [...res, ...items])
      } else {
        return items
      }
    })
}

export function rangeviewsports(type: AmmoType) {
  switch (type) {
    case AmmoType.rimfire:
    case AmmoType.centerfire:
    case AmmoType.shotgun:
      return fn(1).then(items => helpers.classifyBullets(items, type))
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
