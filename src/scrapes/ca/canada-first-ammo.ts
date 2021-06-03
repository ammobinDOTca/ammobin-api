import { ItemType, IItemListing } from '../../graphql-types'
import { combineResults } from '../../helpers'
import throat from 'throat'
import { CANADA_FIRST_AMMO } from '../../vendors'
import axios from 'axios'

// import { RENDERTRON_URL } from '../../constants'

export function canadaFirstAmmo(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info = CANADA_FIRST_AMMO

  const work = async (type: string) => {
    const url = new URL('https://www.searchanise.com/getresults')
    url.searchParams.append('api_key', '6U7j3K4C7X')
    url.searchParams.append('startIndex', '0')
    url.searchParams.append('maxResults', '100')
    url.searchParams.append('items', 'true')
    url.searchParams.append('category', `https://${info.link}/ammunition/${type}`)
    url.searchParams.append('facetsShowUnavailableOptions', 'false')
    url.searchParams.append('restrictBy[stock_status]', 'In Stock')
    // url.searchParams.append('pages', 'true')
    const { data } = await axios.get(url.toString())

    const items: IItemListing[] = []

    data.items.forEach((i) => {
      const link = i.link
      const img = i.image_link
      i.bigcommerce_variants.forEach((sub) => {
        const price = sub.price
        const name = i.title + ' ' + Object.values(sub.options).join(' ')
        const count = sub.options.Quantity ? parseFloat(sub.options.Quantity.replace(/[^\d\.]*/g, '')) : null
        const brand = i.brand

        items.push({
          brand,
          img,
          link,
          name,
          price,
          provinces: info.provinces,
          vendor: info.name,
          count,
        } as IItemListing)
      })
    })
    return items
  }

  switch (type) {
    case ItemType.rimfire:
      return work('rifle/rimfire')

    case ItemType.centerfire:
      return Promise.all(['rifle', 'pistol'].map((t) => throttle(() => work(t)))).then(combineResults)

    case ItemType.shotgun:
      return work('shotgun')
    case ItemType.case:
    case ItemType.shot:
    case ItemType.primer:
    case ItemType.powder:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
