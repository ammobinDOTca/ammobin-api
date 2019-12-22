import { ItemType, IItemListing, IVendor } from '../graphql-types'

export type valueGetterFn = (
  types: ItemType[],
  subTypes: string[],
  vendors: IVendor[]
) => Promise<IItemListing[]>
