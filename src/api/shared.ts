import { SOURCES } from '../constants'
import * as helpers from '../helpers'
import * as redis from 'redis'
import { ScrapeResponse } from '../types'
import {
  IAmmoListingsOnQueryArguments,
  IAmmoListings,
  AmmoType,
} from '../graphql-types'
const client = redis.createClient({ host: 'redis' })

export async function getScrapeResponses(
  params: IAmmoListingsOnQueryArguments
): Promise<IAmmoListings> {
  let { ammoType, page, pageSize, calibre, province, vendor } = params
  const keys = ammoType
    ? SOURCES.map(s => helpers.getKey(s, ammoType))
    : [AmmoType.rimfire, AmmoType.centerfire, AmmoType.shotgun].reduce(
        (lst, t) => lst.concat(SOURCES.map(s => helpers.getKey(s, t))),
        []
      )

  const results: any = await new Promise((resolve, reject) =>
    client.mget(keys, (err, rres) =>
      err ? reject(err) : resolve(rres.map(r => (r ? JSON.parse(r) : null)))
    )
  )

  const result = results
    .reduce((final, r) => (r ? final.concat(r) : final), [])
    .filter(r => r && r.price > 0 && r.calibre && r.calibre !== 'UNKNOWN')
    .sort(function(a, b) {
      if (a.price > b.price) {
        return 1
      } else if (a.price < b.price) {
        return -1
      } else {
        return 0
      }
    })

  const itemsGrouped = result.reduce((r, item) => {
    const key = item.calibre + '_' + item.brand
    if (!r[key]) {
      r[key] = {
        name: `${item.brand} ${item.calibre}`,
        calibre: item.calibre,
        brand: item.brand,
        minPrice: item.price,
        maxPrice: item.price,
        minUnitCost: item.unitCost || 0,
        maxUnitCost: item.unitCost || 0,
        img: item.img,
        vendors: [item],
      }
    } else {
      const val = r[key]
      val.minPrice = Math.min(item.price, val.minPrice)
      val.maxPrice = Math.max(item.price, val.maxPrice)

      if (item.unitCost) {
        if (val.minUnitCost === 0) {
          val.minUnitCost = item.unitCost
        }
        val.minUnitCost = Math.min(item.unitCost, val.minUnitCost)
        val.maxUnitCost = Math.max(item.unitCost, val.maxUnitCost)
      }

      val.img = val.img || item.img
      val.vendors.push(item)
    }
    return r
  }, {})

  let res = Object.keys(itemsGrouped).map(k => itemsGrouped[k])

  if (!calibre && calibre.length > 0) {
    res = res.filter(r => r.calibre === calibre)
  }

  if (!vendor && vendor.length > 0) {
    // todo:
  }
  if (!province && province.length > 0) {
    // todo:
  }
  return {
    page,
    pageSize,
    pages: Math.ceil(res.length / pageSize),
    items: res.slice((page - 1) * pageSize, page * pageSize),
  } as IAmmoListings
}
