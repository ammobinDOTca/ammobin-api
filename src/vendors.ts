import { IVendor, Province } from './graphql-types'
declare type Vendor = Omit<Omit<IVendor, '__typename'>, 'background'>

// todo move other vendors here

export const BACK_COUNTRY_SPORTS: Vendor = {
  name: 'Back Country Sports',
  link: 'backcountrysports.ca',
  location: 'Penticton',
  provinces: [Province.BC],
  logo: 'backcountrysports-logo.png',
  hasReloadingItems: false,
}

export const SYLVESTRE_SPORTING_GOODS: Vendor = {
  name: 'Sylvestre Sporting Goods',
  link: 'shop.sylvestresportinggoods.com',
  location: 'Bonnyville',
  provinces: [Province.AB],
  logo: 'sylvestresportinggoods-logo.png',
  hasReloadingItems: false,
}

export const LONDEROS_SPORTS: Vendor = {
  name: 'Londeros Sports',
  link: 'londerosports.com',
  location: 'Saint-Jean-sur-Richelieu',
  provinces: [Province.QC],
  logo: 'londerosports-logo.png',
  hasReloadingItems: true,
}

export const NORDIC_MARKSMAN: Vendor = {
  name: 'Nordic Marksman',
  link: 'nordicmarksman.com',
  location: 'Truro',
  provinces: [Province.NS],
  logo: 'nordicmarksman-logo.png',
  hasReloadingItems: false,
}

export const PROPHET_RIVER: Vendor = {
  name: 'Prophet River',
  link: 'store.prophetriver.com',
  location: 'Lloydminster',
  provinces: [Province.AB],
  logo: 'prophetriver-logo.png',
  hasReloadingItems: false,
}

export const PRECISION_OPTICS: Vendor = {
  name: 'Precision Optics',
  link: 'precisionoptics.net',
  location: 'Quesnel',
  provinces: [Province.BC],
  logo: 'precisionoptics-logo.png',
  hasReloadingItems: false,
}

export const MARSTAR: Vendor = {
  name: 'Marstar',
  link: 'marstar.ca',
  location: 'Vankleek Hill',
  provinces: [Province.ON],
  logo: 'marstar-logo.png',
  hasReloadingItems: false,
}

export const NAS: Vendor = {
  name: 'N.A.S. Guns and Ammo',
  link: 'nasguns.com',
  logo: 'nas-logo.jpg',
  provinces: [Province.ON],
  location: 'Niagara and Sault Ste. Marie',
  hasReloadingItems: true,
}

export const BULLS_EYE: Vendor = {
  name: 'Bulls Eye North',
  link: 'bullseyenorth.com',
  logo: 'bulls-logo.png',
  provinces: [Province.ON],
  location: 'London',
  hasReloadingItems: true,
}

export const NICKS_SPORTS: Vendor = {
  name: 'Nicks Sports',
  link: 'nickssportshop.ca',
  logo: 'nicks-sports-logo.png',
  provinces: [Province.ON],
  location: 'Toronto',
  hasReloadingItems: false,
}

export const CANADA_FIRST_AMMO: Vendor = {
  name: 'Canada First Ammo',
  link: 'canadafirstammo.ca',
  logo: 'canada-first-ammo.png',
  provinces: [Province.AB],
  location: '_unknown_',
  hasReloadingItems: false,
}

export const TENDA: Vendor = {
  name: 'Tenda',
  link: 'gotenda.com',
  logo: 'tenda-logo.png',
  provinces: [Province.ON],
  location: 'Richmond Hill',
  hasReloadingItems: true,
}

export const GREAT_NORTH_PRECISION: Vendor = {
  name: 'Great North Precision',
  link: 'greatnorthprecision.com',
  logo: 'greatnorthprecision-logo.png',
  provinces: [Province.BC],
  location: 'Kelowna',
  hasReloadingItems: true,
}
