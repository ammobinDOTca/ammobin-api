import { IVendor, Province } from './graphql-types'
declare type Vendor = Omit<Omit<Omit<IVendor, '__typename'>, 'background'>, 'hasReloadingItems'>

// todo move other vendors here

export const BACK_COUNTRY_SPORTS: Vendor = {
  name: 'Back Country Sports',
  link: 'backcountrysports.ca',
  location: 'Penticton',
  provinces: [Province.BC],
  logo: 'backcountrysports-logo.png',
}
