import { SOURCES } from '../constants'
import * as helpers from '../helpers'
import * as redis from 'redis'
import {
  IItemsListingsOnQueryArguments,
  IItemListings,
  ItemType,
  IAmmoGroup,
  IItemListing,
  Province,
  SortOrder,
  SortField,
  IBestPricesOnQueryArguments,
  IBestPrice,
} from '../graphql-types'
const client = redis.createClient({ host: 'redis' })

export async function getBestPrices(
  params: IBestPricesOnQueryArguments
): Promise<IBestPrice[]> {
  const type = params.type || ItemType.centerfire
  const keys = SOURCES.map(s => helpers.getKey(s, type))
  const res: any = await new Promise((resolve, reject) =>
    client.mget(keys, (err, res2) => (err ? reject(err) : resolve(res2)))
  )
  const { calibres } = params
  const results: any = res.map(r => (r ? JSON.parse(r) : null))
  const result = results
    .reduce((final, result2) => {
      return result2 && result2.length ? final.concat(result2) : final
    }, [])
    .reduce((response, item) => {
      if (
        !item ||
        !item.calibre ||
        !item.unitCost ||
        item.calibre === 'UNKNOWN' ||
        (calibres && !calibres.includes(item.calibre))
      ) {
        return response
      }

      if (!response[item.calibre]) {
        response[item.calibre] = {
          unitCost: Number.MAX_SAFE_INTEGER,
          calibre: item.calibre,
          type,
        }
      }

      response[item.calibre].unitCost = Math.min(
        response[item.calibre].unitCost,
        item.unitCost
      )

      return response
    }, {})

  return Object.values(result)
}

function doesItemContainProvince(
  item: IItemListing | any,
  province: Province
): boolean {
  // does the ammo listing contain the given promise
  // need to check 2 properties since have not fully migrated scrapes to return list of provinces instead of
  // of comma separated string
  // TODO: fix this
  return (
    (item.province && item.province.includes(province)) ||
    (item.provinces && item.provinces.includes(province))
  )
}

export async function getScrapeResponses(
  params: IItemsListingsOnQueryArguments
): Promise<IItemListings> {
  let {
    itemType,
    page,
    pageSize,
    calibre,
    province,
    vendor,
    query,
    sortField,
    sortOrder,
  } = params

  if (!sortOrder) {
    sortOrder = SortOrder.ASC
  }

  if (!sortField) {
    sortField = SortField.minUnitCost
  }

  if (isNaN(page) || page < 1) {
    page = 1
  }

  if (isNaN(pageSize) || pageSize < 1) {
    pageSize = 25
  } else if (pageSize > 100) {
    pageSize = 100
  }

  const keys: string[] = ItemType
    ? SOURCES.map(s => helpers.getKey(s, ItemType))
    : [ItemType.rimfire, ItemType.centerfire, ItemType.shotgun].reduce(
        (lst, t) => lst.concat(SOURCES.map(s => helpers.getKey(s, t))),
        []
      )

  const results: IItemListing[][] = await new Promise((resolve, reject) =>
    client.mget(keys, (err, rres: string[]) =>
      err ? reject(err) : resolve(rres.map(r => (r ? JSON.parse(r) : null)))
    )
  )

  const result: IItemListing[] = results
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

  const itemsGrouped = result.reduce(
    (r, item) => {
      // if provided, filter out items that DONT match
      if (
        (calibre && item.calibre !== calibre) ||
        (vendor && item.vendor !== vendor) ||
        (province && !doesItemContainProvince(item, province)) ||
        (query && !item.name.toLowerCase().includes(query.toLowerCase()))
      ) {
        return r
      }

      const key = item.calibre + '_' + item.brand
      if (!r[key]) {
        r[key] = {
          name: `${item.brand} ${item.calibre}`,
          calibre: item.calibre,
          brand: item.brand,
          minPrice: item.price,
          maxPrice: item.price,
          ItemType: item.ItemType,
          minUnitCost: item.unitCost || 0,
          maxUnitCost: item.unitCost || 0,
          img: item.img,
          vendors: [item],
        } as IAmmoGroup
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

        if (val.img) {
          // randomly pick group image
          val.img = Math.random() > 0.5 ? item.img : val.img
        } else {
          val.img = item.img
        }

        val.vendors.push(item)
      }
      return r
    },
    <{ [key: string]: IAmmoGroup }>{}
  )

  // flatten map and sort groups by sortField + sortKey
  let res = Object.keys(itemsGrouped)
    .map(k => itemsGrouped[k])
    .sort((a, b) => {
      let aa = a[sortField]
      let bb = b[sortField]
      // put unknown unit costs at the bottom of the sort order
      if (sortField === SortField.minUnitCost) {
        if (aa <= 0) {
          aa = Number.MAX_SAFE_INTEGER
        }
        if (bb <= 0) {
          bb = Number.MAX_SAFE_INTEGER
        }
      }
      const order = sortOrder === SortOrder.ASC ? 1 : -1
      if (aa === bb) {
        return 0
      } else if (aa > bb) {
        return 1 * order
      } else {
        return -1 * order
      }
    })
  // paginate
  // and then sort vendor listings within the selected groups
  let items = res.slice((page - 1) * pageSize, page * pageSize).map(row => {
    row.vendors = row.vendors.sort((a, b) => {
      let groupedKey: string
      switch (sortField) {
        case SortField.minUnitCost:
          groupedKey = 'unitCost'
          break
        case SortField.name:
          groupedKey = 'name'
          break
        case SortField.minPrice:
          groupedKey = 'price'
          break
        case SortField.link:
          groupedKey = 'vendor'
          break
        default:
          console.error('unhandled sort key', sortField)
      }
      let aa = a[groupedKey]
      let bb = b[groupedKey]
      // put unknown unit costs at the bottom of the sort order
      if (groupedKey === 'unitCost') {
        if (aa <= 0) {
          aa = Number.MAX_SAFE_INTEGER
        }
        if (bb <= 0) {
          bb = Number.MAX_SAFE_INTEGER
        }
      }
      const order = sortOrder === SortOrder.ASC ? 1 : -1
      if (aa === bb) {
        return 0
      } else if (aa > bb) {
        return 1 * order
      } else {
        return -1 * order
      }
    })
    return row
  })

  return {
    page,
    pageSize,
    pages: Math.ceil(res.length / pageSize),
    items,
  } as IItemListings
}
