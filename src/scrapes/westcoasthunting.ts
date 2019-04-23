import axios from 'axios'

import cheerio from 'cheerio'
import * as helpers from '../helpers'
import throat from 'throat'
import { ItemType, IItemListing, Province } from '../graphql-types'

async function fn(type: String, page = 1): Promise<IItemListing[]> {
  const r = await axios.get(
    `http://www.westcoasthunting.ca/product-category/ammunition/${type}/page/${page}/`
  )
  let $ = cheerio.load(r.data)
  const items = []
  $('.product').each((index, row) => {
    const result: any = {}
    const tha = $(row)
    if (tha.find('.outofstock').length) {
      return
    }

    result.link = tha.find('a').prop('href')
    result.img = tha.find('.attachment-shop_catalog').prop('src')
    result.name = tha.find('h3').text()
    result.price = parseFloat(
      tha
        .find('.amount')
        .text()
        .replace('$', '')
    )
    result.vendor = 'West Coast Hunting Supplies'
    result.provinces = [Province.BC]
    items.push(result)
  })

  if ($('.fa-angle-right').length) {
    // load next page
    $ = null // dont hold onto current page
    console.log('loading westcoasthunting page', page + 1)
    return (await fn(type, page + 1)).concat(items)
  } else {
    return items
  }
}

export function westCoastHunting(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  switch (type) {
    case ItemType.rimfire:
      return fn('rimfire-others').then(i => helpers.classifyBullets(i, type))

    case ItemType.centerfire:
      return Promise.all([
        throttle(() => fn('handgun-ammo')),
        throttle(() => fn('rifle-ammo')),
      ])
        .then(helpers.combineResults)
        .then(i => helpers.classifyBullets(i, type))

    case ItemType.shotgun:
      return fn('shotgun-ammo').then(helpers.classifyShotgun)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
