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
  ammoListings: IAmmoListings | null
}

export interface IVendorsOnQueryArguments {
  province?: Province | null
}

export interface IBestPricesOnQueryArguments {
  type?: AmmoType | null
  calibre?: string | null
}

export interface IAmmoListingsOnQueryArguments {
  page?: number | null
  pageSize?: number | null
  type?: AmmoType | null
  calibre?: string | null
  province?: Province | null
  vendor?: string | null
  sortOrder?: SortOrder | null
  sortField?: string | null
}

export const enum Province {
  AB = 'AB',
  BC = 'BC',
  MB = 'MB',
  NB = 'NB',
  NS = 'NS',
  NT = 'NT',
  NU = 'NU',
  ON = 'ON',
  PE = 'PE',
  QC = 'QC',
  SK = 'SK',
  YT = 'YT',
}

export interface IVendor {
  __typename: string | null
  name: string
  provinces: Array<Province>
  location: string
  logo: string
  link: string
  background: boolean | null
}

export const enum AmmoType {
  centerfire = 'centerfire',
  rimfire = 'rimfire',
  shotgun = 'shotgun',
}

export interface IBestPrice {
  __typename: string | null
  unitCost: number
  calibre: string
  type: AmmoType
}

export const enum SortOrder {
  ASC = 'ASC',
  DES = 'DES',
}

export interface IAmmoListings {
  __typename: string | null
  page: number
  pages: number
  pageSize: number
  items: Array<IAmmoGroup>
}

export interface IAmmoGroup {
  __typename: string | null
  name: string
  brand: string
  calibre: string
  type: AmmoType
  vendors: Array<IAmmoListing>
}

export interface IAmmoListing {
  __typename: string | null
  img: string
  price: number
  name: string
  link: string
  vendor: string
  provinces: Array<Province>
  calibre: string
  brand: string
  count: number | null
  unitCost: number | null
}

// tslint:enable
