// tslint:disable
// graphql typescript definitions

export interface IGraphQLResponseRoot {
  data?: IQuery
  errors?: Array<IGraphQLResponseError>
}

export interface IGraphQLResponseError {
  /** Required for all errors */
  message: string
  locations?: Array<IGraphQLResponseErrorLocation>
  /** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
  [propName: string]: any
}

export interface IGraphQLResponseErrorLocation {
  line: number
  column: number
}

export interface IQuery {
  __typename: string | null
  vendors: Array<IVendor | null> | null
  bestPrices: Array<IBestPrice | null> | null
  itemsListings: IItemListings | null
  itemsFlatListings: IItemFlatListings | null
}

export interface IVendorsOnQueryArguments {
  province?: string | null
}

export interface IBestPricesOnQueryArguments {
  type?: ItemType | null
  calibres?: Array<string> | null
}

export interface IItemsListingsOnQueryArguments {
  page?: number | null
  pageSize?: number | null
  itemType?: ItemType | null
  subType?: string | null
  province?: string | null
  vendor?: string | null
  sortOrder?: SortOrder | null
  sortField?: SortField | null
  query?: string | null
  brand?: string | null
}

export interface IItemsFlatListingsOnQueryArguments {
  page?: number | null
  pageSize?: number | null
  itemType?: ItemType | null
  subType?: string | null
  province?: string | null
  vendor?: string | null
  sortOrder?: SortOrder | null
  sortField?: FlatSortField | null
  query?: string | null
  brand?: string | null
}

export interface IVendor {
  __typename: string | null
  name: string
  provinces: Array<string>
  location: string
  logo: string
  link: string
  background: boolean | null
  hasReloadingItems: boolean | null
}

export const enum ItemType {
  ammo = 'ammo',
  centerfire = 'centerfire',
  rimfire = 'rimfire',
  shotgun = 'shotgun',
  reloading = 'reloading',
  powder = 'powder',
  shot = 'shot',
  case = 'case',
  primer = 'primer',
}

export interface IBestPrice {
  __typename: string | null
  unitCost: number
  calibre: string
  type: ItemType
}

export const enum SortOrder {
  ASC = 'ASC',
  DES = 'DES',
}

export const enum SortField {
  name = 'name',
  link = 'link',
  minPrice = 'minPrice',
  minUnitCost = 'minUnitCost',
}

export interface IItemListings {
  __typename: string | null
  page: number
  pages: number
  pageSize: number
  items: Array<IItemGroup>
}

export interface IItemGroup {
  __typename: string | null
  name: string
  brand: string
  subType: string | null
  itemType: ItemType
  minPrice: number
  maxPrice: number
  minUnitCost: number | null
  maxUnitCost: number | null
  img: string | null
  vendors: Array<IItemListing>
}

export interface IItemListing {
  __typename: string | null
  img: string | null
  price: number
  name: string
  link: string
  vendor: string
  provinces: Array<string | null> | null
  subType: string | null
  brand: string
  count: number | null
  unitCost: number | null
  itemType: ItemType
  ttl: number | null
}

export const enum FlatSortField {
  name = 'name',
  link = 'link',
  price = 'price',
  unitCost = 'unitCost',
}

export interface IItemFlatListings {
  __typename: string | null
  page: number
  pages: number
  pageSize: number
  items: Array<IItemListing>
}

export const enum Province {
  AB = 'AB',
  BC = 'BC',
  MB = 'MB',
  NB = 'NB',
  NL = 'NL',
  NS = 'NS',
  NT = 'NT',
  NU = 'NU',
  ON = 'ON',
  PE = 'PE',
  QC = 'QC',
  SK = 'SK',
  YT = 'YT',
}

export const enum State {
  FL = 'FL',
  IA = 'IA',
  IL = 'IL',
  NV = 'NV',
  SC = 'SC',
  TN = 'TN',
  TX = 'TX',
  WA = 'WA',
}

// tslint:enable
