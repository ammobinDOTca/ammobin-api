import {
  IItemsFlatListingsOnQueryArguments,
  IItemFlatListings,
  SortOrder,
  FlatSortField,
  ItemType,
  IItemListing,
} from '../graphql-types'
import { RELOAD_TYPES, AMMO_TYPES, SOURCES, VENDORS } from '../constants'
import * as helpers from '../helpers'
import * as redis from 'redis'

const client = redis.createClient({ host: 'redis' })

export async function getItemsFlatListings(
  args: IItemsFlatListingsOnQueryArguments
): Promise<IItemFlatListings> {
  let {
    itemType,
    page,
    pageSize,
    subType,
    province,
    vendor,
    sortField,
    sortOrder,
    query,
    brand,
  } = args

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
  let vendors: string[] = SOURCES
  if (vendor) {
    const vv = VENDORS.find(v => v.name === vendor)
    vendors = vv ? [new URL(vv.link).hostname.replace('www.', '')] : []
  } else if (province) {
    vendors = VENDORS.filter(v => v.provinces.includes(province)).map(v =>
      new URL(v.link).hostname.replace('www.', '')
    )
  }

  const keys: string[] = types
    .map(t =>
      vendors.map(s =>
        (subType ? [subType] : helpers.itemTypeToStubTypes(t)).map(st =>
          helpers.getKey(s, t, st)
        )
      )
    )
    .flat<string>(Infinity)

  const results: IItemListing[][] = await new Promise((resolve, reject) =>
    client.mget(keys, (err, rres: string[]) =>
      err ? reject(err) : resolve(rres.map(r => (r ? JSON.parse(r) : null)))
    )
  )

  // only filters out ammo without subType set (not setup for reloading yet)
  const result: IItemListing[] = results
    .reduce((final, r) => (r ? final.concat(r) : final), [])
    .filter(
      r =>
        r &&
        r.price > 0 &&
        (!AMMO_TYPES.includes(itemType) ||
          (r.subType && r.subType !== 'UNKNOWN')) &&
        (!brand ||
          (r.brand && r.brand.toLowerCase() === brand.toLowerCase())) &&
        (!query || r.name.toLowerCase().includes(query.toLowerCase()))
    )

  // flatten map and sort groups by sortField + sortKey
  let res = result.sort((a, b) => {
    let aa = a[sortField]
    let bb = b[sortField]
    // put unknown unit costs at the bottom of the sort order
    if (sortField === FlatSortField.unitCost) {
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
  let items = res.slice((page - 1) * pageSize, page * pageSize)

  return {
    page,
    pageSize,
    pages: Math.ceil(res.length / pageSize),
    items,
  } as IItemFlatListings
}
