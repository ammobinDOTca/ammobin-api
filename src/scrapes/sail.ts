import axios from 'axios'
import { ItemType, IItemListing, Province } from '../graphql-types'
import { Info } from './common'
import * as helpers from '../helpers'

export function sail(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    link: 'sail.ca',
    name: `Sail`,
    provinces: [Province.ON, Province.QC],
  }

  async function work(t: string, page = 1) {
    await helpers.delayScrape(info.link)
    const {
      data: { pagination, results },
    } = await axios.get(
      `https://api.searchspring.net/api/search/search.json?resultsFormat=native&siteId=s8zq1c&domain=https%3A%2F%2Fwww.sail.ca%2Fen%2Fhunting%2Ffirearms%2Fammunition%2F${t.toLowerCase()}&bgfilter.category_hierarchy=Hunting>Firearms>Ammunition>${t}&q=&page=${page}`
    )

    const items: IItemListing[] = results.map((r) => {
      return {
        brand: r.brand,
        img: r.thumbnailImageUrl,
        itemType: type,
        link: r.url,
        name: r.name,
        price: r.price,
        provinces: info.provinces,
        vendor: info.name,
      } as IItemListing
    })
    if (pagination.currentPage >= pagination.nextPage) {
      return items
    } else {
      return (await work(t, page + 1)).concat(items)
    }
  }

  switch (type) {
    case ItemType.rimfire:
      return work('Rimfire')
    case ItemType.centerfire:
      return work('Centerfire')
    case ItemType.shotgun:
      return work('Shotguns')

    case ItemType.shot:
    case ItemType.case:
    case ItemType.powder:
    case ItemType.primer:
      return Promise.resolve(null) // no reloading 20190635
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
