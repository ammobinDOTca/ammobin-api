import { ItemType, IItemListing, Province } from '../../graphql-types'
import { Info } from '../common'
import Axios from 'axios'

export function triggerAndBows(type: ItemType): Promise<IItemListing[]|null> {
  const info: Info = {
    link: 'triggersandbows.com',
    name: `Triggers & Bows`,
    provinces: [Province.ON],
  }

  async function work(pType: string, reqPage = 1) {
    const res = await Axios.get(`https://shop.${info.link}/${pType}/page${reqPage}.ajax`)

    const { page, pages, products } = res.data

    const results = (products || [])
      .filter((p) => p.available)
      .map(
        (p) =>
          ({
            img: p.image,
            link: p.url,
            name: p.title,
            price: p.price.price,
            provinces: [Province.ON],
            vendor: info.name,
          } as IItemListing)
      )

    if (page < pages) {
      return results.concat(await work(pType, reqPage + 1))
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
    case ItemType.case:
    case ItemType.primer:
    case ItemType.powder:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
