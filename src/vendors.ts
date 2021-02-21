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

export const PRECISION_OPTICS: Vendor = {
  name: 'Precision Optics',
  link: 'precisionoptics.net',
  location: 'Quesnel',
  provinces: [Province.BC],
  logo: 'precisionoptics-logo.png',
}

export const MARSTAR: Vendor = {
  name: 'Marstar',
  link: 'marstar.ca',
  location: 'Vankleek Hill',
  provinces: [Province.ON],
  logo: 'marstar-logo.png',
}

export const NAS: Vendor = {
  name: 'N.A.S. Guns and Ammo',
  link: 'nasguns.com',
  logo: 'nas-logo.jpg',
  provinces: [Province.ON],
  location: 'Niagara and Sault Ste. Marie',
}

export const BULLS_EYE: Vendor = {
  name: 'Bulls Eye North',
  link: 'bullseyenorth.com',
  logo: 'bulls-logo.png',
  provinces: [Province.ON],
  location: 'London',
}

export const NICKS_SPORTS: Vendor = {
  name: 'Nicks Sports',
  link: 'nickssportshop.ca',
  logo: 'nicks-sports-logo.png',
  provinces: [Province.ON],
  location: 'Toronto',
}

export const CANADA_FIRST_AMMO: Vendor = {
  name: 'Canada First Ammo',
  link: 'canadafirstammo.ca',
  logo: 'canada-first-ammo.png',
  provinces: [Province.AB],
  location: '_unknown_',
}
