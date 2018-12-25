// tslint:disable
// graphql typescript definitions

declare namespace GQL {
  interface IGraphQLResponseRoot {
    data?: IQuery
    errors?: Array<IGraphQLResponseError>
  }

  interface IGraphQLResponseError {
    /** Required for all errors */
    message: string
    locations?: Array<IGraphQLResponseErrorLocation>
    /** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
    [propName: string]: any
  }

  interface IGraphQLResponseErrorLocation {
    line: number
    column: number
  }

  interface IQuery {
    __typename: 'Query'
    vendors: Array<IVendor | null> | null
    bestPrices: Array<IBestPrice | null> | null
    ammoListings: IAmmoListings | null
  }

  interface IVendorsOnQueryArguments {
    province?: Province | null
  }

  interface IBestPricesOnQueryArguments {
    type?: AmmoType | null
    calibre?: string | null
  }

  interface IAmmoListingsOnQueryArguments {
    page?: number | null
    pageSize?: number | null
    type?: AmmoType | null
    calibre?: string | null
    province?: string | null
    vendor?: string | null
    sortOrder?: string | null
    sortField?: string | null
  }

  const enum Province {
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

  interface IVendor {
    __typename: 'Vendor'
    name: string | null
    provinces: Array<Province | null> | null
    location: string | null
    logo: string | null
    link: string | null
  }

  const enum AmmoType {
    centerfire = 'centerfire',
    rimfire = 'rimfire',
    shotgun = 'shotgun',
  }

  interface IBestPrice {
    __typename: 'BestPrice'
    unitCost: number | null
    calibre: string | null
    type: AmmoType | null
  }

  interface IAmmoListings {
    __typename: 'AmmoListings'
    page: number | null
    pages: number | null
    pageSize: number | null
    items: Array<IAmmoGroup | null> | null
  }

  interface IAmmoGroup {
    __typename: 'AmmoGroup'
    name: string | null
    brand: string | null
    calibre: string | null
    type: AmmoType | null
    vendors: Array<IAmmoListing | null> | null
  }

  interface IAmmoListing {
    __typename: 'AmmoListing'
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
}

// tslint:enable
