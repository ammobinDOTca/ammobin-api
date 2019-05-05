import axios from 'axios'
import cheerio = require('cheerio')
import {
  delayScrape,
  classifyRimfire,
  classifyCenterfire,
  classifyShotgun,
  combineResults,
} from '../helpers'
import throat = require('throat')
<<<<<<< HEAD
import { ItemType, IItemListing, Province } from '../graphql-types'
=======
import { ItemType, IItemListing } from '../graphql-types'
>>>>>>> feab54d9e1e79924b667054539fbc6048034108a
async function work(type, page = 1): Promise<IItemListing[]> {
  await delayScrape('https://www.bvoutdoors.com')

  console.log(`loading bvoutdoors ${type} ${page}`)
  return axios
    .get(`https://www.bvoutdoors.com/${type}/?page=${page}&matchesperpage=80`)
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = []
      $('.product-list-item').each((index, row) => {
        const result: any = {}
        const tha = $(row)
        result.link = tha.find('.product-link').prop('href')
        result.img = tha.find('.image-thumb').prop('src')
        result.name = tha.find('.productnameTitle').text()
        const priceTxt = tha.find('.text-price').text()
        result.price = parseFloat(priceTxt.replace('$', ''))
        result.brand = tha.find('.caption h6').text()
        result.vendor = 'BV Outdoor Essentials'
        result.province = 'BC'
        result.provinces = [Province.BC]

        items.push(result)
      })

      if ($('.button-small.next').length) {
        $ = null // dont hold onto page for recursion
        return work(type, page + 1).then(results => items.concat(results))
      } else {
        return items
      }
    })
}
export function bvoutdoors(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)

  switch (type) {
    case 'rimfire':
      return work('Ammunition-Rimfire-2').then(classifyRimfire)

    case 'centerfire':
      return Promise.all(
        ['Ammunition-Rifle-1', 'Ammunition-Handgun-108'].map(t =>
          throttle(() => work(t, 1))
        )
      )
        .then(combineResults)
        .then(classifyCenterfire)

    case 'shotgun':
      return Promise.all(
        [
          'Ammunition-Shotshells-3',
          'Ammunition-Slugs-258',
          'Ammunition-Buckshot-257',
        ].map(t => throttle(() => work(t, 1)))
      )
        .then(combineResults)
        .then(classifyShotgun)
    case ItemType.case:
      return work('reloading-unprimed-brass-341')
    case ItemType.shot:
      return work('Reloading-Bullets-%26-Brass-110')
    case ItemType.primer:
      return work('Reloading-Primers-342')
    case ItemType.powder:
      return work('Reloading-Powder-%26-Primers-111')
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
