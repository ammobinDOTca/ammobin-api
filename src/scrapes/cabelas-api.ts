import axios from 'axios'
import cheerio = require('cheerio')
import throat from 'throat'
import helpers = require('../helpers')
import { ItemType, IItemListing, Province } from '../graphql-types'
import { Info, Selectors, scrape } from './common'

const columns = [
  ['link', 'Article #'],
  ['brand', 'Brand'],
  ['type', 'Generic Name'],
  ['calibre', 'Gauge', 'Calibre', 'Caliber'],
  ['velocity', 'Velocity (FPS)'],
  ['bullet', 'Bullet Type', 'Type'],
  ['weight', 'Bullet Weight', 'Shot Size'],
  ['count', 'Rounds per Box'],
  ['price', 'Price'],
  ['status', 'Status'],
].map(c => c.map(s => s.toLowerCase()))

const info: Info = {
  site: 'cabelas.ca',
  vendor: `Cabela's`,
  provinces: [
    Province.BC,
    Province.AB,
    Province.SK,
    Province.MB,
    Province.ON,
    Province.NB,
    Province.NS,
  ],
}

const selectors: Selectors = {
  item: '.productCard',
  name: '.productCard-heading',
  img: '.productCard-thumb img',
  link: '.productCard-heading a',
  price: '.price-primary',
}
const BASE = 'https://www.' + info.site

function classify(d) {
  if (!d.titles || !d.items) {
    return null
  }

  const titles = d.titles
  const myTitles = titles.map(t => {
    const find = columns.find(
      colNames => colNames.indexOf(t.toLowerCase()) >= 0
    )
    if (find) {
      return find[0] // if found a match, return the common property name
    } else {
      return ''
    }
  })

  const items = d.items

  const result = items.map(i => {
    const item: any = {
      vendor: info.vendor,
      provinces: info.provinces,
    }
    for (let index = 0; index < 12; index++) {
      let value = i[index.toString()]
      const prop = myTitles[index]
      if (!prop) {
        continue
      }

      if (prop === 'link') {
        value = BASE + value
      } else if (prop === 'price') {
        value = parseFloat(value.replace('$', ''))
      } else if (prop === 'count') {
        value = parseInt(value, 10) || value
      }
      if (value) {
        item[prop] = value
      }
    }

    item.name = `${item.brand} ${item.type || ''} ${
      item.calibre
    },  ${item.weight || ''} ${item.bullet || ''} ${item.velocity ||
      ''}, box of ${item.count}`
    return item
  })

  return result.filter(r => !isNaN(r.price) && r.price > 0)
}

async function makeCabelasCalibre(ammotype, subtype) {
  await helpers.delayScrape(BASE)

  return axios
    .get(`${BASE}/checkproductvariantavailability/${ammotype}?specs=${subtype}`)
    .then(r => {
      const $ = cheerio.load(r.data)

      const titles = []
      $('thead')
        .find('th')
        .each((index, row) => titles.push($(row).text()))

      const items = []
      $('tbody')
        .find('tr')
        .each((index, row) => {
          const result = []
          result.push(
            $(row)
              .find('a')
              .prop('href')
          )
          $(row)
            .find('td')
            .each((i, f) => {
              result.push(
                $(f)
                  .text()
                  .trim()
              )
            })
          items.push(result)
        })
      return { items, titles }
    })
    .then(classify)
}

function makeCabelasReq(itemType) {
  return makeCabelasCalibre(itemType, null)
}

function work(path: String): Promise<IItemListing[]> {
  return scrape(p => `${BASE}/category/${path}/?pagesize=100`, info, selectors)
}

export function cabelas(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)

  switch (type) {
    case ItemType.rimfire:
      return makeCabelasReq('936')
    case ItemType.shotgun:
      return Promise.all([
        throttle(() => makeCabelasReq('928')),
        throttle(() => makeCabelasReq('922')),
        throttle(() => makeCabelasReq('923')),
        throttle(() => makeCabelasReq('924')),
        throttle(() => makeCabelasReq('926')),
      ]).then(helpers.combineResults)
    case ItemType.centerfire:
      return Promise.all([
        throttle(() => makeCabelasReq('916')),
        throttle(() => makeCabelasCalibre('933', '19365')), // 204 ruger
        throttle(() => makeCabelasCalibre('933', '20529')), // 22-250 rem
        throttle(() => makeCabelasCalibre('933', '20476')), // 223 rem
        throttle(() => makeCabelasCalibre('933', '20554')), // 243 win
        throttle(() => makeCabelasCalibre('933', '20543')), // 270 win
        throttle(() => makeCabelasCalibre('933', '20556')), // 270 wsm
        throttle(() => makeCabelasCalibre('933', '20641')), // 300 rem mag
        throttle(() => makeCabelasCalibre('933', '20547')), // 30 30 win
        throttle(() => makeCabelasCalibre('933', '19413')), // 303 brit
        throttle(() => makeCabelasCalibre('933', '20486')), // 308 wim
        throttle(() => makeCabelasCalibre('933', '20483')), // .30-06 Springfield
        throttle(() => makeCabelasCalibre('933', '20516')), // 338 lapua
        throttle(() => makeCabelasCalibre('933', '20491')), // 40/70
        throttle(() => makeCabelasCalibre('933', '20494')), // 7.62x39
        throttle(() => makeCabelasCalibre('933', '20561')), // 7mm-08
        throttle(() => makeCabelasCalibre('933', '20552')), // 7mm rem mag
        throttle(() => makeCabelasCalibre('933', '20557')), // 7mm wm
      ]).then(helpers.combineResults)
    case ItemType.shot:
      return work('reloading-bullets/2552')
    case ItemType.case:
      return work('reloading-brass/2553')
    case ItemType.powder:
      return work('reloading-powder/987')
    case ItemType.primer:
      return work('reloading-primers/2554')
    default:
      throw new Error(`unknown type received: ${type}`)
  }
}
