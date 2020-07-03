import { AMMO_TYPES, RELOAD_TYPES, VENDORS } from '../constants'
import * as helpers from '../helpers'

import { IItemsFlatListingsOnQueryArguments, IItemFlatListings, IVendor } from '../graphql-types'
import {
  IItemsListingsOnQueryArguments,
  IItemListings,
  ItemType,
  IItemGroup,
  IItemListing,
  SortOrder,
  SortField,
  FlatSortField,
  IBestPrice,
} from '../graphql-types'
import { valueGetterFn } from './types'

export async function getBestPrices(): Promise<IBestPrice[]> {
  return Promise.resolve(null)
  // TODO: not used
  // const type = params.type || ItemType.centerfire
  // const { calibres } = params

  // const keys: string[] = SOURCES.map(s =>
  //   calibres.map(subType => helpers.getKey(s, type, subType))
  // ).flat<string>(Infinity)

  // const res: any = await new Promise((resolve, reject) =>
  //   client.mget(keys, (err, res2) => (err ? reject(err) : resolve(res2)))
  // )
  // const results: IItemListing[][] = res.map(r => (r ? JSON.parse(r) : null))
  // const result = results
  //   .reduce((final, result2) => {
  //     return result2 && result2.length ? final.concat(result2) : final
  //   }, [])
  //   .reduce((response, item) => {
  //     if (
  //       !item ||
  //       !item.subType ||
  //       !item.unitCost ||
  //       item.subType === 'UNKNOWN' ||
  //       (calibres && !calibres.includes(item.subType))
  //     ) {
  //       return response
  //     }

  //     if (!response[item.subType]) {
  //       response[item.subType] = {
  //         unitCost: Number.MAX_SAFE_INTEGER,
  //         calibre: item.subType,
  //         subType: item.subType,
  //         type,
  //       }
  //     }

  //     response[item.subType].unitCost = Math.min(
  //       response[item.subType].unitCost,
  //       item.unitCost
  //     )

  //     return response
  //   }, {})

  // return Object.values(result)
}

export async function getScrapeResponses(
  params: IItemsListingsOnQueryArguments,
  valueGetter: (types: ItemType[], subTypes: string[], vendors: IVendor[]) => Promise<IItemListing[]>
): Promise<IItemListings> {
  let { itemType, page, pageSize, subType, province, vendor, query, sortField, sortOrder, brand } = params

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

  let itemTypes: ItemType[]
  switch (itemType) {
    case ItemType.reloading:
      itemTypes = RELOAD_TYPES
      break
    // default to ammo if nothing
    case ItemType.ammo:
    case undefined:
    case null:
      itemTypes = AMMO_TYPES
      break
    default:
      itemTypes = [itemType]
  }

  // figure out subset of keys to get (keys are stored by vendor)
  let vendors: IVendor[] = VENDORS
  if (vendor) {
    vendors = VENDORS.filter((v) => v.name === vendor)
  } else if (province) {
    vendors = VENDORS.filter((v) => v.provinces.includes(province))
  }

  const subTypes = subType ? [subType] : itemTypes.reduce((lst, t) => lst.concat(helpers.itemTypeToStubTypes(t)), [])
  let results: IItemListing[] = await valueGetter(itemTypes, subTypes, vendors)

  const result: IItemListing[] = results
    .filter(
      (r) =>
        r &&
        r.price > 0 &&
        (!AMMO_TYPES.includes(itemType) || r.subType) &&
        (!brand || (r.brand && r.brand.toLowerCase() === brand.toLowerCase()))
    )
    .sort((a, b) => {
      if (a.price > b.price) {
        return 1
      } else if (a.price < b.price) {
        return -1
      } else {
        return 0
      }
    })
  const itemsGrouped = result.reduce((r, item) => {
    // if provided, filter out items that DONT match
    if ((subType && item.subType !== subType) || (query && !item.name.toLowerCase().includes(query.toLowerCase()))) {
      return r
    }

    const key = item.subType + '_' + item.brand
    if (!r[key]) {
      r[key] = {
        name: `${item.brand} ${item.subType}`,
        subType: item.subType,
        brand: item.brand,
        minPrice: item.price,
        maxPrice: item.price,
        itemType: item.itemType,
        minUnitCost: item.unitCost || 0,
        maxUnitCost: item.unitCost || 0,
        img: item.img,
        vendors: [item],
      } as IItemGroup
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
  }, <{ [key: string]: IItemGroup }>{})

  // flatten map and sort groups by sortField + sortKey
  let res = Object.keys(itemsGrouped)
    .map((k) => itemsGrouped[k])
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
  let items = res.slice((page - 1) * pageSize, page * pageSize).map((row) => {
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

export async function getItemsFlatListings(
  args: IItemsFlatListingsOnQueryArguments,
  valueGetter: valueGetterFn
): Promise<IItemFlatListings> {
  let { itemType, page, pageSize, subType, province, vendor, sortField, sortOrder, query, brand } = args

  if (!sortOrder) {
    sortOrder = SortOrder.ASC
  }

  if (!sortField) {
    sortField = FlatSortField.unitCost
  }

  if (isNaN(page) || page < 1) {
    page = 1
  }

  if (isNaN(pageSize) || pageSize < 1) {
    pageSize = 25
  } else if (pageSize > 100) {
    pageSize = 100
  }

  let types: ItemType[]
  switch (itemType) {
    case ItemType.reloading:
      types = RELOAD_TYPES
      break
    // default to ammo if nothing
    case ItemType.ammo:
    case undefined:
    case null:
      types = AMMO_TYPES
      break
    default:
      types = [itemType]
  }

  // figure out subset of keys to get (keys are stored by vendor)
  let vendors: IVendor[] = VENDORS
  if (vendor) {
    vendors = VENDORS.filter((v) => v.name === vendor)
  } else if (province) {
    vendors = VENDORS.filter((v) => v.provinces.includes(province))
  }
  const subTypes = subType ? [subType] : types.reduce((lst, t) => lst.concat(helpers.itemTypeToStubTypes(t)), [])
  let results: IItemListing[] = await valueGetter(types, subTypes, vendors)

  // only filters out ammo without subType set (not setup for reloading yet)
  const result: IItemListing[] = results.filter(
    (r) =>
      r &&
      r.price > 0 &&
      (!AMMO_TYPES.includes(itemType) || r.subType) &&
      (!brand || (r.brand && r.brand.toLowerCase() === brand.toLowerCase())) &&
      (!query || r.name.toLowerCase().includes(query.toLowerCase()))
  )

  // flatten map and sort groups by sortField + sortKey
  let res = result.sort((a, b) => {
    let aa = a[sortField]
    let bb = b[sortField]
    // put unknown unit costs at the bottom of the sort order
    if (sortField === FlatSortField.unitCost) {
      if (aa <= 0 || aa === undefined) {
        aa = Number.MAX_SAFE_INTEGER
      }

      if (bb <= 0 || bb === undefined) {
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
  let items = res.slice((page - 1) * pageSize, page * pageSize)

  return {
    page,
    pageSize,
    pages: Math.ceil(res.length / pageSize),
    items,
  } as IItemFlatListings
}

// todo: merge the 2 functions together...
