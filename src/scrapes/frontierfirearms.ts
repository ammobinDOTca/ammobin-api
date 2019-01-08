import axios from 'axios'
import cheerio = require('cheerio')
import helpers = require('../helpers')
import throat = require('throat')
import { AmmoType, IAmmoListing } from '../graphql-types'
function work(type: string): Promise<IAmmoListing[]> {
  return axios
    .get(`http://frontierfirearms.ca/ammunition-reloading/${type}.html`)
    .then(r => {
      const $ = cheerio.load(r.data)
      const items = []
      $('#frmCompare li').each((index, row) => {
        const result: any = {}
        const tha = $(row)
        result.link = tha.find('.pname').prop('href')
        result.img = tha.find('img').prop('src')
        result.name = tha.find('.pname').text()
        const priceTxt =
          tha.find('.p-price .SalePrice').text() || tha.find('.p-price').text()
        result.price = parseFloat(priceTxt.replace('$', ''))
        result.vendor = 'Frontier Firearms'
        result.province = 'SK'

        items.push(result)
      })

      return items
    })
}

export function frontierfirearms(type: AmmoType): Promise<IAmmoListing[]> {
  const throttle = throat(1)

  switch (type) {
    case AmmoType.rimfire:
      return work('rimfire-ammunition').then(helpers.classifyRimfire)

    case AmmoType.centerfire:
      return Promise.all(
        [
          'surplus-ammunition',
          'hand-gun-ammunition',
          'centerfire-ammunition',
        ].map(t => throttle(() => work(t)))
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)

    case AmmoType.shotgun:
      return work('shotgun-shells').then(helpers.classifyShotgun)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
