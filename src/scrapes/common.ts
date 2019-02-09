import axios from 'axios'

import cheerio from 'cheerio'
import * as helpers from '../helpers'
import throat from 'throat'
import { AmmoType, IAmmoListing, Province } from '../graphql-types'

export interface Selectors {
  item: string
  outOfStock?: string
  name: string
  img: string
  link: string
  price: string
  nextPage?: string
}

export interface Info {
  site: string
  vendor: string
  provinces: Province[]
}

export async function scrape(
  getUrl: (page: number) => string,
  info: Info,
  selectors: Selectors,
  page = 1
): Promise<IAmmoListing[]> {
  await helpers.delayScrape(info.site)

  const r = await axios.get(getUrl(page))
  let $ = cheerio.load(r.data)
  const items = []
  $(selectors.item).each((index, row) => {
    const result: any = {}
    const tha = $(row)

    if (selectors.outOfStock && tha.find(selectors.outOfStock).length > 0) {
      return
    }
    result.link = tha.find(selectors.link).prop('href')
    result.img = tha.find(selectors.img).prop('src')
    result.name = tha
      .find(selectors.name)
      .text()
      .trim()
    const priceTxt = tha
      .find(selectors.price)
      .last()
      .text() // sale price come last...
    result.price = parseFloat(priceTxt.replace('$', ''))

    result.vendor = info.vendor
    result.provinces = info.provinces

    items.push(result)
  })

  if (selectors.nextPage && $(selectors.nextPage).length > 0) {
    $ = null // dont hold onto page for recursion
    const more = await scrape(getUrl, info, selectors, page + 1)
    return items.concat(more)
  } else {
    return items
  }
}
