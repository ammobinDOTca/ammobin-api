import { ItemType, IItemListing, Province } from '../graphql-types'
import { Info } from './common'
import Axios from 'axios'

export function triggerAndBows(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    site: 'triggersandbows.com',
    vendor: `Triggers & Bows`,
    provinces: [Province.ON],
  }

  async function work(pType: string, reqPage = 1) {
    const res = await Axios.get(
      `https://shop.${info.site}/${pType}/page${reqPage}.ajax`
    )

    const { page, pages, products } = res.data

    const results = (products || [])
      .filter(p => p.available)
      .map(
        p =>
          ({
            img: p.image,
            link: p.url,
            name: p.title,
            price: p.price.price,
            provinces: [Province.ON],
            vendor: info.vendor,
          } as IItemListing)
      )

    if (page < pages) {
      return results.concat(await work(type, reqPage + 1))
    } else {
      return results
    }
  }

  switch (type) {
    case ItemType.rimfire:
      return work('ammunition/rimfire')
    case ItemType.centerfire:
      return work('ammunition/centerfire')
    case ItemType.shotgun:
      return work('ammunition/shotgun-shells')

    case ItemType.shot:
      return work('ammunition/reloading-supplies/bullets')

    case ItemType.case:
      return work('ammunition/reloading-supplies/brass')

    case ItemType.powder:
      return work('ammunition/reloading-supplies/powder')

    case ItemType.primer:
      return work('ammunition/reloading-supplies/primers')

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
