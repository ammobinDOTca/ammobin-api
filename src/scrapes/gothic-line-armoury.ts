import axios from 'axios'
import cheerio = require('cheerio')
import * as helpers from '../helpers'
import { Type, ScrapeResponse } from '../types'

async function work(type = 'doesnt matter', page = 1) {
  const domain = 'https://gothiclinearmoury.ca'
  await helpers.delayScrape(domain)
  console.log(`loading ${domain}  ${type} ${page}`)

  return axios.get(`${domain}/product-category/ammunition`).then(r => {
    const $ = cheerio.load(r.data)
    const items = []
    $('.product').each((index, row) => {
      const result: any = {}
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

export function gothicLineArmoury(type: Type): Promise<ScrapeResponse> {
  switch (type) {
    case Type.rimfire:
    case Type.shotgun:
      return Promise.resolve([])

    case Type.centerfire:
      return work().then(helpers.classifyCenterfire)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
