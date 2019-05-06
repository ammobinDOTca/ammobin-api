import axios from 'axios'
import cheerio from 'cheerio'
import * as helpers from '../helpers'
import throat from 'throat'
import { ItemType, IItemListing } from '../graphql-types'
async function work(type: string, page = 1) {
  await helpers.delayScrape('https://www.bartonsbigcountry.ca')

  console.log(`loading Bartons ${type} ${page}`)
  return axios
    .get(
      `https://www.bartonsbigcountry.ca/ammunition/${type}.html?product_list_limit=30&p=${page}`
    )
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = []
      $('.content .item').each((index, row) => {
        const result: any = {}
        const tha = $(row)
        result.link = tha.find('.product-item-link').prop('href')
        result.img = tha.find('.product-image-photo').prop('src')
        result.name = tha
          .find('.item-title')
          .text()
          .trim()
        const priceTxt = tha
          .find('.price')
          .last()
          .text() // sale price come last...
        result.price = parseFloat(priceTxt.replace('CA$', ''))
        if (isNaN(result.price)) {
          return // dont include empty prices
        }
        result.vendor = 'Bartons Big Country'
        result.province = 'AB'

        items.push(result)
      })

      if (items.length && $('.pages-item-next').length > 0) {
        $ = null // dont hold onto page for recursion
        return work(type, page + 1)
          .then(results => items.concat(results))
          .catch(e => {
            // sometimes go too far and get 404
            if (e.response && e.response.status === 404) {
              console.warn('went too far with bartons page: ' + page)
              return items
            }
            throw e
          })
      } else {
        return items
      }
    })
}
export function barton(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)

  switch (type) {
    case ItemType.rimfire:
      return work('rimfire').then(helpers.classifyRimfire)

    case ItemType.centerfire:
      return Promise.all(
        ['centerfire-pistol', 'centerfire-rifle', 'bulk-surplus'].map(t =>
          throttle(() => work(t, 1))
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)

    case ItemType.shotgun:
      return work('shotgun-ammunition').then(helpers.classifyShotgun)
    // todo: reloading

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
