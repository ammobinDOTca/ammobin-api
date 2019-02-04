import axios from 'axios'
import cheerio = require('cheerio')
import * as helpers from '../helpers'
import { AmmoType, IAmmoListing } from '../graphql-types'

const SITE = 'https://store.theshootingcentre.com'

async function work(type: string, page = 1) {
  await helpers.delayScrape(SITE)

  console.log(`loading theShootingCenter ${page}`)
  return axios.get(`${SITE}/ammunition/${type}?page=${page}`).then(r => {
    let $ = cheerio.load(r.data)
    const items = []
    $('.product-item').each((index, row) => {
      const result: any = {}
      const tha = $(row)
      result.link = SITE + tha.find('.product-item-link').prop('href')
      result.img = tha.find('.product-image-photo').prop('src')
      if (result.img && result.img.indexOf('no-image') >= 0) {
        result.img = null
      }
      result.name = tha
        .find('.product-item-link')
        .text()
        .trim()
      const priceTxt = tha.find('.price').text()
      result.price = parseFloat(priceTxt.replace('$', ''))

      result.vendor = 'Calgary Shooting Center'
      result.provinces = ['AB']

      items.push(result)
    })

    if ($('pages-item-next').length > 0) {
      $ = null // dont hold onto page for recursion
      return work(type, page + 1).then(results => items.concat(results))
    } else {
      return items
    }
  })
}

export function theShootingCenter(type: AmmoType): Promise<IAmmoListing[]> {
  switch (type) {
    case AmmoType.rimfire:
      return work('rimfire').then(helpers.classifyRimfire)
    case AmmoType.centerfire:
      return work('centrefire').then(helpers.classifyCenterfire)
    case AmmoType.shotgun:
      return work('shotshell').then(helpers.classifyShotgun)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
