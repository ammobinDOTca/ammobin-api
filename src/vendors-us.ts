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

export const GUNMAG: Vendor = {
  name: 'Gun Mag Warehouse',
  link: 'gunmagwarehouse.com',
  logo: 'gunmag-logo.png',
  provinces: [State.TX],
  location: 'Coppell',
  hasReloadingItems: false,
}
