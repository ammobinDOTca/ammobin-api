import axios from 'axios'
import cheerio = require('cheerio')
import throat = require('throat')
import * as helpers from '../helpers'

async function work(type, page = 1) {
  await helpers.delayScrape('https://www.solelyoutdoors.com')
  console.log(`loading solely outdoors ${page}`)

  return axios
    .get(`https://www.solelyoutdoors.com/ammunition/${type}/page${page}.html`)
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = []
      $('.product').each((index, row) => {
        const result: any = {}
        const tha = $(row)

        result.link = tha.find('.image-wrap a').prop('href')
        result.img = tha.find('.image-wrap img').prop('src')
        result.name = tha
          .find('.image-wrap a')
          .prop('title')
          .trim()
        const priceTxt = tha.find('.info .left').text()
        result.price = parseFloat(priceTxt.replace('C$', ''))
        result.vendor = 'Soley Outdoors'
        result.province = 'ON'

        items.push(result)
      })

      // having redirect problem, disabled pulling other pages for now
      if (1 > 2 && $('.next.enabled').length) {
        $ = null // dont hold onto page for recursion
        return work(type, page + 1).then(results => items.concat(results))
      } else {
        return items
      }
    })
}

export function solelyOutdoors(type) {
  const throttle = throat(1)

  switch (type) {
    case 'rimfire':
      return work('rimfire', 1).then(helpers.classifyRimfire)

    case 'centerfire':
      return Promise.all(
        [
          'centerfire',
          // 'handgun-ammo',
          // 'rifle-ammo'
        ].map(t => throttle(() => work(t)))
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)

    case 'shotgun':
      return work('shotgun', 1).then(helpers.classifyShotgun)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
