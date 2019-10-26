import axios from 'axios'

import cheerio from 'cheerio'
import * as helpers from '../helpers'
import { IItemListing, Province } from '../graphql-types'

export interface Selectors {
  item: string
  outOfStock?: string
  name: string
  img: string
  link: string
  price: string
  nextPage?: string
  salePrice?: string
}

export interface Info {
  site: string
  vendor: string
  provinces: Province[]
}

function correctUrl(baseUrl: string, url: string): string {
  // note: assuming everyone is on https b/c its 2019
  if (!url || !baseUrl) {
    return null
  } else if (url.startsWith('//')) {
    return 'https:' + url
  } else if (url.startsWith('/')) {
    return 'https://' + baseUrl + url
  } else if (!url.startsWith('http')) {
    // some people use relative urls....
    return 'https://' + baseUrl + '/' + url
  }

  return url
}

export async function scrape(
  getUrl: (page: number) => string,
  info: Info,
  selectors: Selectors,
  page = 1
): Promise<IItemListing[]> {
  await helpers.delayScrape(info.site)
  console.log(getUrl(page))
  const r = await axios.get(getUrl(page))
  let $ = cheerio.load(r.data)
  const items = []
  $(selectors.item).each((index, row) => {
    const result = {} as IItemListing
    const tha = $(row)

    if (selectors.outOfStock && tha.find(selectors.outOfStock).length > 0) {
      return
    }
    result.link = correctUrl(info.site, tha.find(selectors.link).prop('href'))
    result.img = correctUrl(info.site, tha.find(selectors.img).prop('src'))

    result.name = tha
      .find(selectors.name)
      .text()
      .trim()
    const priceTxt = tha
      .find(selectors.price)
      .last()
      .text() // sale price come last...

    result.price = parseFloat(priceTxt.replace(/[^\d\.]*/g, ''))

    result.vendor = info.vendor
    result.provinces = info.provinces

    items.push(result)
  })

  if (
    selectors.nextPage &&
    $(selectors.nextPage).length > 0 &&
    items.length > 0
  ) {
    $ = null // dont hold onto page for recursion
    const more = await scrape(getUrl, info, selectors, page + 1)
    return items.concat(more)
  } else {
    return items
  }
}
