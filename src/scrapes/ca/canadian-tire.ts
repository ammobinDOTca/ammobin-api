import axios from 'axios'
import * as helpers from '../../helpers'
import { ItemType, IItemListing, Province } from '../../graphql-types'

function work(page: string): Promise<IItemListing[]|null> {
  // TODO: need to get all result pages  ("pagination": {"total": 6, )
  console.log('canadian tire page ' + page)
  return axios
    .get(
      `https://api.canadiantire.ca/search/api/v0/product/en/?site=ct;store=0600;x1=c.cat-level-1;q1=Playing;x2=c.cat-level-2;q2=Hunting;x3=c.cat-level-3;q3=Ammunition;x4=c.cat-level-4;q4=${encodeURIComponent(
        page
      )};format=json;count=36;q=*;callback=callback`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
          Refer: 'https://www.canadiantire.ca/en/sports-rec/hunting/ammunition.html',
        },
        timeout: 5000
      }
    )
    .then((res) => {
      const t = res.data.replace('callback(', '')

      const f = t.slice(0, t.length - 2)
      const items = JSON.parse(f).results.map((ff) => {
        const item = ff.field
        return {
          name: item['prod-name'],
          link: 'https://www.canadiantire.ca' + item['pdp-url'],
          img: item['thumb-img-url'],
          vendor: 'Canadian Tire',
          provinces: [
            Province.YT,
            Province.NT,
            Province.BC,
            Province.AB,
            Province.SK,
            Province.MB,
            Province.ON,
            Province.QC,
            Province.NB,
            Province.PE,
            Province.NS,
            Province.NL,
          ],
          _id: item['prod-id'],
        }
      })
      console.log('got ' + items.length + ' items. check price')
      return axios
        .get('https://www.canadiantire.ca/ESB/PriceAvailability', {
          params: {
            _: new Date().getTime(),
            Product: items.map((ff) => ff[`_id`]).join(','),
            Store: '0600',
            Banner: 'CTR',
            isKiosk: 'FALSE',
            Language: 'E',
          },
          headers: {
            'User-Agent':
              'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
            Host: 'www.canadiantire.ca',
            Refer: 'https://www.canadiantire.ca/en/sports-rec/hunting/ammunition.html',
          },
          timeout: 5000, //ms
        })
        .then((r) => {
          const list = Object.keys(r.data).map((k) => r.data[k])
          console.log('got ' + list.length + ' avails')
          return items.map((i) => {
            i.price = (list.find((rr) => rr.Product === i[`_id`]) || {}).Price
            return i
          })
        })
    })
}

export function canadiantire(type: ItemType): Promise<IItemListing[]|null> {
  switch (type) {
    case ItemType.rimfire:
      return work('Rimfire Ammunition')
    case ItemType.centerfire:
      return work('Centerfire Ammunition')
    case ItemType.shotgun:
      return Promise.all([work('Lead Shotgun Shells'), work('Steel Shotgun Shells'), work('Slugs & Buckshots')]).then(
        helpers.combineResults
      )
    case ItemType.shot:
    case ItemType.powder:
    case ItemType.case:
    case ItemType.primer:
      return Promise.resolve(null)

    default:
      throw new Error(`unknown type: ${type}`)
  }
}
