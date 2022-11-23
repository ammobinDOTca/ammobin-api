import axios from 'axios'
import { ItemType, IItemListing, Province } from '../../graphql-types'
import throat from 'throat'
import cheerio = require('cheerio')
import * as helpers from '../../helpers'
const SITE = 'https://www.tradeexcanada.com'
// 0 based list
//
const throttle = throat(1)
async function work(product: string, page = 0) {
  await helpers.delayScrape(SITE)
  console.log(`loading page ${page} for tradex`)

  return axios.get(`${SITE}/produits/${product}?page=${page}`).then((r) => {
    let $ = cheerio.load(r.data)
    const items:any[] = []
    $('.views-view-grid .col-1, .views-view-grid .col-2, .views-view-grid .col-3, .views-view-grid .col-4').each(
      (index, row) => {
        const result: any = {}
        const tha = $(row)

        result.link = SITE + tha.find('.views-field-title a').prop('href')
        result.img = tha.find('img').prop('src')
        result.name = tha.find('.views-field-body').text()
        const priceTxt = tha.find('.uc-price').text()
        result.price = parseFloat(priceTxt.replace('$', ''))
        result.vendor = 'Trade Ex Canada'
        result.provinces = [Province.ON]

        // div always present, empty if actually in stock
        if (tha.find('.uc_out_of_stock_html').first().text()) {
          return
        }

        items.push(result)
      }
    )

    if ($('.pager-last.last').length) {
      $ = (null as any) // dont hold onto page
      return work(product, page + 1).then((res) => items.concat(res))
    } else {
      return items
    }
  })
}

export function tradex(type: ItemType): Promise<IItemListing[]|null> {
  switch (type) {
    case ItemType.centerfire:
    case ItemType.shotgun:
    case ItemType.rimfire:
      return work('78', 0)
    case ItemType.shot:
      return Promise.all(['87', '88'].map((t) => throttle<any>(() => work(t, 0)))).then(helpers.combineResults)
    case ItemType.case:
    case ItemType.primer:
      return work('87', 0)
    case ItemType.powder:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
