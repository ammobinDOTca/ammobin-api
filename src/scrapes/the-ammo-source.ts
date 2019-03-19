import axios from 'axios'
import cheerio = require('cheerio')
import * as helpers from '../helpers'
import throat = require('throat')
const SITE = 'https://www.theammosource.com'

async function getStuff(cPath, page = 1) {
  await helpers.delayScrape(SITE)

  return axios
    .get(`${SITE}/store/index.php?main_page=index&cPath=${cPath}&page=${page}`)
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = []
      $('.productListing-odd , .productListing-even').each((index, row) => {
        const result: any = {}
        const tha = $(row)

        // wish there was a better way to do this, but the html is not making it easy
        let soldOut = false
        tha.find('.productListing-data img').each((i, subrow) => {
          soldOut = soldOut || $(subrow).prop('alt') === 'Sold Out'
        })

        if (soldOut) {
          return
        }

        result.link = tha.find('.listing a').prop('href')
        const src = tha.find('.listingProductImage').prop('src')
        result.img = src ? SITE + '/' + src : null
        result.name = tha.find('.itemTitle').text()

        tha.find('.productListing-data').each((_, subrow) => {
          const ff = $(subrow)
          if (!ff.contents().text()) {
            return
          }
          result.price = parseFloat(
            ff
              .contents()
              .text()
              .replace('$', '')
          )
        })
        result.price = result.price || -1

        result.vendor = 'The Ammo Source'
        result.province = 'ON'
        items.push(result)
      })

      const itemCounts = $('#productsListingTopNumber')
        .text()
        .split(' ')
        .map(s => parseInt(s, 10))
        .filter(n => !isNaN(n))

      if (itemCounts[1] < itemCounts[2]) {
        $ = null // dont hold onto page
        console.log(
          `loaded ammo source ${itemCounts[0]} - ${itemCounts[1]} out of ${
            itemCounts[2]
          }`
        )
        return getStuff(cPath, page + 1).then(res => items.concat(res))
      } else {
        return items
      }
    })
}

export function theAmmoSource(type) {
  const throttle = throat(1)
  switch (type) {
    case 'rimfire':
      return Promise.all(
        [
          '1_108_151', // 17 HMR
          '1_108_440', // 17 Mach 2
          '1_108_624', // 17 WSM
          '1_108_113', // 22LR, 22 Short, 22 WMR,
        ].map(t => throttle(() => getStuff(t, 1)))
      )
        .then(helpers.combineResults)
        .then(helpers.classifyRimfire)

    case 'shotgun':
      return Promise.all(
        [
          '1_108_641', // 10
          '1_108_114', // 12
          '1_108_117', // 16
          '1_108_135', // 20
          '1_108_136', // 28
          '1_108_134', // .410
        ].map(t => throttle(() => getStuff(t, 1)))
      )
        .then(helpers.combineResults)
        .then(helpers.classifyShotgun)

    case 'centerfire':
      return Promise.all(
        [
          '1_108_119', // 10mm
          '1_108_481', // 17 Hornet
          '1_108_482', // 204 Ruger
          '1_108_152', // 22 Hornet & 222 Remington
          '1_108_941', // 22 Nosler
          '1_108_153', // 22-250 Rem
          '1_108_754', // 220 Swift
          '1_108_109', // 223 Rem & 5.56 NATO
          '1_108_639', // 240 Weatherby
          '1_108_139', // 243 Win & 243 WSSM
          '1_108_126', // 25 ACP/6.35 Browning
          '1_108_311', // 25-06 Rem
          '1_108_589', // 250 Savage
          '1_108_478', // 257 Roberts
          '1_108_932', // 26 Nosler
          '1_108_774', // 260 Rem
          '1_108_140', // 270 Win
          '1_108_267', // 270 Win Short Mag
          '1_108_933', // 28 Nosler
          '1_108_931', // 280 Ackley Improved
          '1_108_148', // 280 Remington
          '1_108_154', // 30 Carbine
          '1_108_934', // 30 Nosler
          '1_108_120', // 30-06 Springfield
          '1_108_141', // 30-30 WIN
          '1_108_411', // 300 Savage
          '1_108_337', // 300 Whisper/Blackout
          '1_108_142', // 300 Win Mag
          '1_108_285', // 300 WSM
          '1_108_143', // 303 British
          '1_108_110', // 308 Win & 7.62x51
          '1_108_127', // 32 ACP/7.65 Browning
          '1_108_125', // 32 S&W
          '1_108_746', // 32 Special
          '1_108_849', // 338 Federal
          '1_108_168', // 338 Lapua
          '1_108_479', // 338 Win Mag
          '1_108_441', // 35 Remington
          '1_108_848', // 35 Whelen
          '1_108_122', // 357 Magnum
          '1_108_137', // 357 Sig
          '1_108_811', // 375 H&H
          '1_108_133', // 38 S&W
          '1_108_124', // 38 Special
          '1_108_936', // 38 Super
          '1_108_128', // 380 Auto/9mm Browning
          '1_108_116', // 40 S&W
          '1_108_613', // 416 Rigby
          '1_108_150', // 44 Magnum & 44 Special
          '1_108_483', // 44-40
          '1_108_749', // 444 Marlin
          '1_108_115', // 45 ACP
          '1_108_131', // 45 GAP
          '1_108_129', // 45 Long Colt
          '1_108_189', // 45-70 Government
          '1_108_147', // 450 Marlin
          '1_108_250', // 454 Casull
          '1_108_521', // 455 Webley
          '1_108_541', // 460 S&W
          '1_108_666', // 480 Ruger
          '1_108_459', // 5.45x39
          '1_108_765', // 5.7x28
          '1_108_132', // 50 AE
          '1_108_597', // 50 BMG
          '1_108_258', // 500 S&W
          '1_108_450', // 6.5 Creedmoor
          '1_108_307', // 6.5 Grendel
          '1_108_930', // 6.5-284 Norma
          '1_108_875', // 6.5x52 Carcano
          '1_108_876', // 6.5x54 Mannlicher-Schoenauer
          '1_108_145', // 6.5x55
          '1_108_146', // 6.8 SPC
          '1_108_943', // 6mm Creedmoor
          '1_108_310', // 6mm Rem
          '1_108_409', // 7.5x54 French
          '1_108_371', // 7.5x55 Swiss
          '1_108_396', // 7.62 Nagant
          '1_108_123', // 7.62x25
          '1_108_111', // 7.62x39
          '1_108_112', // 7.62x54R
          '1_108_877', // 7.65mm Argentine Mauser
          '1_108_395', // 7.92x33 Kurz
          '1_108_155', // 7mm Mauser (7x57)
          '1_108_144', // 7mm Rem Mag
          '1_108_927', // 7mm REM SAUM
          '1_108_937', // 7mm WSM
          '1_108_542', // 7mm-08 Rem
          '1_108_156', // 8mm Mauser
          '1_108_410', // 8x56R Hungarian
          '1_108_397', // 9mm Browning Long
          '1_108_118', // 9mm Luger / 9x19 / 9mm NATO
          '1_108_138', // 9mm Makarov
        ].map(t => throttle(() => getStuff(t, 1)))
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
