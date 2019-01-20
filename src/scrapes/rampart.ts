import axios from 'axios'
import cheerio from 'cheerio'
import * as helpers from '../helpers'
import throat from 'throat'
import { AmmoType, IAmmoListing, Province } from '../graphql-types'

const URL = 'https://rampartcorp.com'

async function work(type: string, page = 1) {
  await helpers.delayScrape(URL)

  console.log(`loading rampart  ${type} ${page}`)
  return axios.get(`${URL}/collections/${type}`).then(r => {
    let $ = cheerio.load(r.data)
    const items = []
    $('.grid__item ').each((index, row) => {
      const tha = $(row)
      const result: IAmmoListing = {
        link: URL + tha.find('.product-card').prop('href'),
        img: 'https:' + tha.find('.product-card__image').prop('src'),
        name: tha
          .find('.product-card__name')
          .text()
          .trim(),
        price: parseFloat(
          tha
            .find('.product-card__price')
            .text()
            .replace('$', '')
        ),

        vendor: 'Rampart',
        provinces: [Province.ON],
        calibre: undefined,
        brand: undefined,
        count: undefined,
        __typename: null,
        unitCost: undefined,
        ammoType: undefined,
      }

      if (!result.price || isNaN(result.price)) {
        return
      }

      items.push(result)
    })
    return items
  })
}
export function rampart(type: AmmoType): Promise<IAmmoListing[]> {
  const throttle = throat(1)

  switch (type) {
    case AmmoType.rimfire:
      return work('22lr').then(helpers.classifyRimfire)

    case AmmoType.centerfire:
      return Promise.all(
        ['pistol-calibres', 'rifle-calibres'].map(t =>
          throttle(() => work(t, 1))
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)

    case AmmoType.shotgun:
      return work('12-gauge').then(helpers.classifyShotgun)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
