import { ItemType, IItemListing, IVendor } from '../graphql-types'

/**
 * get all records for servicing graphql queries
 */
export type valueGetterFn = (
  types: ItemType[],
  subTypes: string[],
  vendors: IVendor[]
) => Promise<IItemListing[]>

/**
 * function to get record for tracking a click
 */
export type getRecordFn = (
  itemType: ItemType,
  subType: string,
  vendor: IVendor,
  link: string
) => Promise<IItemListing | null>
