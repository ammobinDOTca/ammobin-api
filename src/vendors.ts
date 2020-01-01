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

export const SYLVESTRE_SPORTING_GOODS: Vendor = {
  name: 'Sylvestre Sporting Goods',
  link: 'shop.sylvestresportinggoods.com',
  location: 'Bonnyville',
  provinces: [Province.AB],
  logo: 'sylvestresportinggoods-logo.png',
}

export const LONDEROS_SPORTS: Vendor = {
  name: 'Londeros Sports',
  link: 'londerosports.com',
  location: 'Saint-Jean-sur-Richelieu',
  provinces: [Province.QC],
  logo: 'londerosports-logo.png',
}

export const NORDIC_MARKSMAN: Vendor = {
  name: 'Nordic Marksman',
  link: 'nordicmarksman.com',
  location: 'Truro',
  provinces: [Province.NS],
  logo: 'nordicmarksman-logo.png',
}

export const PROPHET_RIVER: Vendor = {
  name: 'Prophet River',
  link: 'store.prophetriver.com',
  location: 'Lloydminster',
  provinces: [Province.AB],
  logo: 'prophetriver-logo.png',
}
