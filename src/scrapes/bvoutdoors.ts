import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'
import { combineResults } from '../helpers'
import throat from 'throat'

export function bvoutdoors(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info: Info = {
    site: 'bvoutdoors.com',
    vendor: `BV Outdoor Essentials`,
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.product-list-item',
    name: '.productnameTitle',
    img: '.image-thumb',
    link: '.product-link',
    price: '.text-price',
    //brand: '.caption h6',
    nextPage: '.button-small.next',
    //    outOfStock: '.out-of-stock',
  }

  const work = t =>
    scrape(
      page => `https://www.${info.site}/${t}/?page=${page}&matchesperpage=80`,
      info,
      selectors
    )
  switch (type) {
    case ItemType.rimfire:
      return work('Ammunition-Rimfire-2')

    case ItemType.centerfire:
      return Promise.all(
        ['Ammunition-Rifle-1', 'Ammunition-Handgun-108'].map(t =>
          throttle(() => work(t))
        )
      ).then(combineResults)

    case ItemType.shotgun:
      return Promise.all(
        [
          'Ammunition-Shotshells-3',
          'Ammunition-Slugs-258',
          'Ammunition-Buckshot-257',
        ].map(t => throttle(() => work(t)))
      ).then(combineResults)
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
