import * as helpers from '../helpers'
<<<<<<< HEAD
import { ItemType, IItemListing, Province } from '../graphql-types'
=======
import throat from 'throat'
import { ItemType, IItemListing } from '../graphql-types'

const SITE = 'https://alsimmonsgunshop.com'

async function work(type: string, page = 1): Promise<IItemListing[]> {
  await helpers.delayScrape(SITE)
  console.log(`loading al simmons ${type} ${page}`)

  return axios
    .get(
      `${SITE}/product-category/ammunition/${type}/page/${page}/?instock_products=in`
    )
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = []
      $('.type-product').each((index, row) => {
        const result: any = {}
        const tha = $(row)
        result.link = tha.find('.post-image a').prop('href')
        result.img = 'https:' + tha.find('.wp-post-image').prop('src')
        result.name = tha.find('.product-content-inner h3').text()
        const priceTxt = tha
          .find('.price')
          .last()
          .text() // sale price come last...
        result.price = parseFloat(priceTxt.replace('$', ''))

        result.vendor = 'Al Simmons'
        result.province = 'ON'
>>>>>>> feab54d9e1e79924b667054539fbc6048034108a

import { scrape, Info, Selectors } from './common'

export function alSimmons(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    site: 'alsimmonsgunshop.com',
    vendor: `Al Simmons`,
    provinces: [Province.ON],
  }

<<<<<<< HEAD
  const selectors: Selectors = {
    item: '.product ',
    name: '.product-title',
    img: '.wp-post-image',
    link: '.product-title a',
    price: '.price',
    nextPage: '.next',
    outOfStock: '.out-of-stock',
  }

  switch (type) {
    case ItemType.rimfire:
    case ItemType.centerfire:
    case ItemType.shotgun:
      return scrape(
        p =>
          `https://${
            info.site
          }/product-category/ammunition/page/${p}/?product_count=100`,
        info,
        selectors
      ).then(helpers.classify(type))
=======
export function alSimmons(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)

  switch (type) {
    case ItemType.rimfire:
      return work('rimfire-ammunition').then(helpers.classifyRimfire)

    case ItemType.centerfire:
      return Promise.all(
        ['rifle-ammunition', 'handgun-ammunition'].map(t =>
          throttle(() => work(t, 1))
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)

    case ItemType.shotgun:
      return Promise.resolve([])
>>>>>>> feab54d9e1e79924b667054539fbc6048034108a

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
