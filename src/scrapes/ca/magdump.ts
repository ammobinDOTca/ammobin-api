import axios from 'axios'
import * as helpers from '../../helpers'
import { ItemType, IItemListing, Province } from '../../graphql-types'
import throat from 'throat'

async function work(type) {
  await helpers.delayScrape('https://magdump.ca')
  const r = await axios.get(`https://magdump.ca/${type}`)
  return r.data.products.map((p) => {
    return {
      link: p.link,
      img: 'img',
      name: p.name,
      price: p.price_amount,
      vendor: 'Mag Dump',
      province: Province.AB,
    }
  })
}

// TODO: need to pull item counts out from each page
// TODO: should pull list calibres... instead of hardcoded list

export async function magdump(type: ItemType): Promise<IItemListing[]|null> {
  const throttle = throat(1)

  switch (type) {
    case 'rimfire':
      return Promise.all(
        [
          '13-22-long-rifle',
          // '17-hmr'
        ].map((t) => throttle(() => work(t)))
      ).then(helpers.combineResults)

    case 'centerfire':
      return Promise.all(
        ['16-9mm', '17-223-rem', '18-308-win', '19-12-gauge', '20-762x39mm', '21-45-acp'].map((t) =>
          throttle(() => work(t))
        )
      ).then(helpers.combineResults)

    case 'shotgun':
      return Promise.all(['17-12-gauge'].map((t) => throttle(() => work(t)))).then(helpers.combineResults)
    case ItemType.shot:
    case ItemType.primer:
    case ItemType.case:
    case ItemType.powder:
      return Promise.resolve(null) // no reloading as of 20190616
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
