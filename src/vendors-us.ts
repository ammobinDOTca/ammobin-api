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
  link: 'www.brownells.com',
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

//TODO below this line
export const IMPACT: Vendor = {
  name: 'Impact Guns',
  link: 'impactguns.com',
  logo: 'impactguns-logo.com',
  provinces: [State.UT, State.ID],
  location: 'Salt Lake City',
  hasReloadingItems: false,
}

export const FOUNDRY: Vendor = {
  name: 'Foundry Outdoors',
  link: 'foundryoutdoors.com',
  logo: 'foundry-logo.png',
  provinces: [State.NH],
  location: 'Bedford',
  hasReloadingItems: false,
}

export const LUCKY: Vendor = {
  name: 'Lucky Gunner',
  link: 'luckygunner.com',
  logo: 'lucky-logo.png',
  provinces: [State.TN],
  location: 'Knoxville',
  hasReloadingItems: false,
}

export const GREEN_COUNTRY: Vendor = {
  name: 'Green Country',
  link: 'greencountryammo.com',
  logo: 'greencountry-logo.png',
  provinces: [State.OK],
  location: 'Tulsa',
  hasReloadingItems: false,
}

//https://bulkmunitions.com/
//https://www.ammoshoponline.com/
// https://www.ammunitiondepot.com/ammunition
// https://www.foundryoutdoors.com/collections/in-stock-ammo
// https://www.cabelas.com/shop/en/centerfire-rifle-ammunition
// https://www.fleetfarm.com/category/hunting/ammunition/_/N-931964591
// https://bulkmunitions.com/gun-store/9mm-124-gr-jhp-federal-hst-p9hst1-1000-rounds/
// https://www.ammofreedom.com/winchester-ammo-xp-350-legend-150-grain-extreme-point-20-rounds-x350ds-p-129458.html?slave_id=10975&utm_source=jssorslidethumb&utm_medium=banner&utm_campaign=index&utm_term=win
// https://www.thebunkerusa.com/catalog/ammo
// https://ammo.com/rifle/223-rem-ammo

// inspect https://www.cheapammos.com/
