import axios from 'axios'
import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'
import throat from 'throat'

async function work(type) {
  await helpers.delayScrape('https://magdump.ca')
  const r = await axios.get(`https://magdump.ca/${type}`)
  return r.data.products.map(p => {
    return {
      link: p.link,
      img: null,
      name: p.name,
      price: p.price_amount,
      vendor: 'Mag Dump',
      province: Province.AB,
    }
  })
}

// TODO: need to pull item counts out from each page
// TODO: should pull list calibres... instead of hardcoded list

export async function magdump(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)

  switch (type) {
    case 'rimfire':
      return Promise.all(
        [
          '13-22-long-rifle',
          // '17-hmr'
        ].map(t => throttle(() => work(t)))
      ).then(helpers.combineResults)

    case 'centerfire':
      return Promise.all(
        [
          '14-223-rem-556x45mm',
          '15-9mm',
          '16-308-win',
          '21-30-06',
          '22-62x39',
          '52-ammo-by-the-can',
        ].map(t => throttle(() => work(t)))
      ).then(helpers.combineResults)

    case 'shotgun':
      return Promise.all(
        ['17-12-gauge'].map(t => throttle(() => work(t)))
      ).then(helpers.combineResults)
    case ItemType.shot:
    case ItemType.primer:
    case ItemType.case:
    case ItemType.powder:
      return Promise.resolve(null) // no reloading as of 20190616
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
