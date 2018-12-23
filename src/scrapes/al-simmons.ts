import axios from 'axios'

import cheerio from 'cheerio'
import * as helpers from '../helpers'
import throat from 'throat'
import { Type, ScrapeResponse } from '../types'

const SITE = 'https://alsimmonsgunshop.com'

async function work(type: string, page = 1) {
  await helpers.delayScrape(SITE)
  console.log(`loading al simmons ${type} ${page}`)

  return axios
    .get(
      `${SITE}/product-category/ammunition/${type}/page/${page}/?instock_products=in`
    )
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = []
      $('.type-product').each((index, row) => {
        const result: any = {}
        const tha = $(row)
        result.link = tha.find('.post-image a').prop('href')
        result.img = 'https:' + tha.find('.wp-post-image').prop('src')
        result.name = tha.find('.product-content-inner h3').text()
        const priceTxt = tha
          .find('.price')
          .last()
          .text() // sale price come last...
        result.price = parseFloat(priceTxt.replace('$', ''))

        result.vendor = 'Al Simmons'
        result.province = 'ON'

        items.push(result)
      })

      if (items.length && items.length === 10) {
        $ = null // dont hold onto page for recursion
        return work(type, page + 1)
          .then(results => items.concat(results))
          .catch(e => {
            // sometimes go too far and get 404
            if (e.response && e.response.status === 404) {
              console.warn('went too far with al simmons page: ' + page)
              return items
            }
            throw e
          })
      } else {
        return items
      }
    })
}

export function alSimmons(type: Type): Promise<ScrapeResponse> {
  const throttle = throat(1)

  switch (type) {
    case Type.rimfire:
      return work('rimfire-ammunition').then(helpers.classifyRimfire)

    case Type.centerfire:
      return Promise.all(
        ['rifle-ammunition', 'handgun-ammunition'].map(t =>
          throttle(() => work(t, 1))
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)

    case Type.shotgun:
      return Promise.resolve([])

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
