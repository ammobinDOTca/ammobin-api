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
  province?: string | null
  vendor?: string | null
  sortOrder?: string | null
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
  unitCost: number | null
  calibre: string | null
  type: AmmoType | null
}

export interface IAmmoListings {
  __typename: string | null
  page: number | null
  pages: number | null
  pageSize: number | null
  items: Array<IAmmoGroup | null> | null
}

export interface IAmmoGroup {
  __typename: string | null
  name: string | null
  brand: string | null
  calibre: string | null
  type: AmmoType | null
  vendors: Array<IAmmoListing | null> | null
}

export interface IAmmoListing {
  __typename: string | null
  img: string | null
  price: number | null
  name: string | null
  link: string | null
  vendor: string | null
  province: string | null
  calibre: string | null
  brand: string | null
  count: number | null
  unitCost: number | null
}

// tslint:enable
