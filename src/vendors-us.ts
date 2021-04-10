import { IVendor, State } from './graphql-types'
declare type Vendor = Omit<Omit<IVendor, '__typename'>, 'background'>

export const BOTACH: Vendor = {
  name: 'Botach',
  link: 'botach.com',
  logo: 'botach-logo.png',
  provinces: [State.NV],
  location: 'Las Vegas',
  hasReloadingItems: false,
}

export const BROWNELLS: Vendor = {
  name: 'Brownells',
  link: 'brownells.com',
  logo: 'brownells-logo.png',
  provinces: [State.IA],
  location: 'Grinnell',
  hasReloadingItems: false, // TODO
}

export const GORILLA: Vendor = {
  name: 'Gorilla Ammunition',
  link: 'gorillaammo.com',
  logo: 'gorilla-logo.png',
  provinces: [State.FL],
  location: 'Vero Beach',
  hasReloadingItems: false,
}
GORILLA['background'] = true

export const GUNMAG: Vendor = {
  name: 'Gun Mag Warehouse',
  link: 'gunmagwarehouse.com',
  logo: 'gunmag-logo.png',
  provinces: [State.TX],
  location: 'Coppell',
  hasReloadingItems: false,
}

export const NATCHEZ: Vendor = {
  name: 'Natchez Shooting Supplies',
  link: 'outdoors.natchezss.com',
  logo: 'natchez-logo.png',
  provinces: [State.TN],
  location: 'Chattanooga',
  hasReloadingItems: false, //TODO true
}

export const OPTICS_PLANET: Vendor = {
  name: 'Optics Planet',
  link: 'opticsplanet.com',
  logo: 'optics-planet-logo.png',
  provinces: [State.IL],
  location: 'Northbrook',
  hasReloadingItems: false,
}

export const PALMETTO: Vendor = {
  name: 'Palmetto State Armory',
  link: 'palmettostatearmory.com',
  logo: 'palmetoo-logo.png',
  provinces: [State.SC],
  location: 'Columbia',
  hasReloadingItems: false,
}

export const RAINER: Vendor = {
  name: 'Rainer Arms',
  link: 'rainierarms.com',
  logo: 'rainer-logo.png',
  provinces: [State.WA],
  location: 'Auburn',
  hasReloadingItems: false, // TODO true
}

export const SPORTSMAN: Vendor = {
  name: "Sportsmans's Warehouse",
  link: 'sportsmans.com',
  logo: 'sportsman-logo.png',
  provinces: [
    //TODO https://stores.sportsmans.com/sportsmans-warehouse/us
  ],
  location: 'all over',
  hasReloadingItems: false, // TODO true
}
