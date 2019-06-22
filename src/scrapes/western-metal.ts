import axios from 'axios'

import cheerio = require('cheerio')
import * as helpers from '../helpers'
import throat from 'throat'
import { ItemType, IItemListing } from '../graphql-types'

async function fn(section, type, page = 1): Promise<IItemListing[]> {
  await helpers.delayScrape('https://www.westernmetal.ca')

  return axios
    .get(
      `https://www.westernmetal.ca/shooting-category/${section}?field_product_types_tid[]=${type}&sort_order=DESC&page=${page}`
    )
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = []
      $('.view-content .views-row').each((index, row) => {
        const result: any = {}
        const tha = $(row)
        if (tha.find('.out-stock').length) {
          return
        }

        result.link =
          'https://www.westernmetal.ca' +
          tha.find('.views-field-title a').prop('href')
        result.img = tha
          .find('.views-field-field-product-image img')
          .prop('src')
        const split = result.link.split('/')
        result.name = split[split.length - 1].split('-').join(' ')
        result.price = parseFloat(
          tha
            .find('.views-field-php')
            .text()
            .replace('$', '')
        )
        result.vendor = 'Western Metal'
        result.province = 'AB'
        items.push(result)
      })

      if ($('.next').length > 0 && items.length > 0) {
        // load next page
        $ = null // dont hold onto current page
        console.log('loading WesternMetal page', page + 1)
        return fn(section, type, page + 1).then(ff => ff.concat(items))
      } else {
        return items
      }
    })
}

export function westernMetal(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  switch (type) {
    case ItemType.rimfire:
      return Promise.resolve(null)

    case ItemType.centerfire:
      return Promise.all([
        throttle(() => fn('new-ammunition', 80)),
        throttle(() => fn('new-ammunition', 81)),
        throttle(() => fn('remanufactured-ammunition', 80)),
        throttle(() => fn('remanufactured-ammunition', 81)),
      ])
        .then(helpers.combineResults)
        .then(i => helpers.classifyBullets(i, type))

    case ItemType.shotgun:
      return fn('new-ammunition', 538).then(helpers.classifyShotgun)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
