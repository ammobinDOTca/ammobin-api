import { IVendor, Province, ItemType } from './graphql-types'
import {
  BACK_COUNTRY_SPORTS,
  SYLVESTRE_SPORTING_GOODS,
  LONDEROS_SPORTS,
  NORDIC_MARKSMAN,
  PROPHET_RIVER,
} from './vendors'
export const QUEUE_NAME = 'SCRAPE_QUEUE'

export const VENDORS: IVendor[] = [
  {
    name: `Cabela's`,
    link: 'cabelas.ca',
    logo: 'cabelas-logo.png',
    provinces: [Province.BC, Province.AB, Province.SK, Province.MB, Province.ON],
    location: 'all over the place',
    hasReloadingItems: true,
  },
  {
    name: 'Sail',
    link: 'sail.ca',
    logo: 'sail-logo.png',
    provinces: [Province.ON, Province.QC],
    location: 'all over the place',
  },
  {
    name: 'Firearms Outlet Canada',
    link: 'firearmsoutletcanada.com',
    logo: 'foc-logo.jpg',
    provinces: [Province.ON],
    location: 'Ajax',
  },
  {
    name: `Al Flaherty's`,
    link: 'alflahertys.com',
    logo: 'al-flahertys-logo.png',
    provinces: [Province.ON],
    location: 'Toronto',
  },
  {
    name: 'Bulls Eye London',
    link: 'bullseyelondon.com',
    logo: 'bulls-logo.png',
    provinces: [Province.ON],
    location: 'London',
  },
  {
    name: 'Canadian Tire',
    link: 'canadiantire.ca',
    logo: 'canadian-tire-logo.png',
    provinces: [
      Province.YT,
      Province.NT,
      Province.BC,
      Province.AB,
      Province.SK,
      Province.MB,
      Province.ON,
      Province.QC,
      Province.NB,
      Province.PE,
      Province.NS,
      Province.NL,
    ],
    location: 'all over the place',
  },
  {
    name: 'Reliable Gun',
    link: 'reliablegun.com',
    logo: 'reliable-gun-logo.jpg',
    provinces: [Province.BC],
    location: 'Vancover',
  },
  {
    name: 'Tenda',
    link: 'gotenda.com',
    logo: 'tenda-logo.png',
    provinces: [Province.ON],
    location: 'Richmond Hill',
  },
  {
    name: 'Canada Ammo',
    link: 'canadaammo.com',
    logo: 'canada-ammo-logo.jpg',
    provinces: [Province.BC, Province.ON],
    location: 'all over the place',
  },
  {
    name: 'Wolverine Supplies',
    link: 'wolverinesupplies.com',
    logo: 'wolverine-logo.png',
    provinces: [Province.MB],
    location: 'Virden',
  },
  {
    name: 'Jo Brook Outdoors',
    link: 'jobrookoutdoors.com',
    logo: 'jo-brook-logo.png',
    provinces: [Province.MB],
    location: 'Brandon',
  },
  {
    name: 'The Ammo Source',
    link: 'theammosource.com',
    logo: 'the-ammo-source-logo.png',
    provinces: [Province.ON],
    location: 'Harrowsmith',
  },
  {
    name: 'Hirsch Precision',
    link: 'hirschprecision.com',
    logo: 'hirsch-logo.png',
    provinces: [Province.NS],
    location: 'Lake Echo',
  },
  {
    name: 'Wild West',
    link: 'gun-shop.ca',
    logo: 'wild.png',
    provinces: [Province.AB],
    location: 'Edmonton',
  },
  {
    name: 'Tiger Arms',
    link: 'tigerarms.ca',
    logo: 'tigerarms.png',
    provinces: [Province.BC],
    location: 'Port Coquitlam',
    background: true,
  },
  {
    name: 'Mag Dump',
    link: 'magdump.ca',
    logo: 'magdump-logo.png',
    provinces: [Province.AB],
    location: 'Sherwood Park',
  },
  {
    name: 'Rangeview Sports',
    // link: 'https://www.rangeviewcanada.com/',
    link: 'rangeviewsports.ca',
    logo: 'rangeview-sports.png',
    provinces: [Province.ON],
    location: 'Newmarket',
  },
  {
    name: 'Trade Ex Canada',
    link: 'tradeexcanada.com',
    logo: 'tradex-logo.png',
    provinces: [Province.ON],
    location: 'Hawkesburry',
  },
  {
    name: 'Frontier Firearms',
    link: 'frontierfirearms.ca',
    logo: 'frontierfirearms-logo.png',
    provinces: [Province.SK],
    location: 'Prince Albert',
  },
  {
    name: 'BV Outdoor Essentials',
    link: 'bvoutdoors.com',
    logo: 'bvoutdoors-logo.png',
    provinces: [Province.BC],
    location: 'Smithers',
  },
  {
    name: 'NAS Guns & Ammo',
    link: 'nasgunsandammo.com',
    logo: 'nas-logo.jpg',
    provinces: [Province.ON],
    location: 'Niagara and Sault Ste. Marie',
  },
  {
    name: 'Dante Sports',
    link: 'dantesports.com',
    logo: 'dante-logo.png',
    provinces: [Province.QC],
    location: 'Montréal',
  },
  {
    name: 'Lever Arms',
    link: 'leverarms.com',
    logo: 'leverarms-logo.png',
    provinces: [Province.BC],
    location: 'Vancouver',
  },
  {
    name: 'Calgary Shooting Center',
    link: 'store.theshootingcentre.com',
    logo: 'shooting-center-logo.jpg',
    provinces: [Province.AB],
    location: 'Calgary',
  },
  {
    name: 'Western Metal',
    link: 'westernmetal.ca',
    logo: 'westernmetal-logo.png',
    provinces: [Province.AB],
    location: 'somewhere',
  },
  {
    name: 'Al Simmons',
    link: 'alsimmonsgunshop.com',
    logo: 'al-simmons-logo.jpg',
    provinces: [Province.ON],
    location: 'Hamilton',
  },
  {
    name: 'Vancouver Gun Store',
    link: 'vancouvergunstore.ca',
    logo: 'vancouvergunstore-logo.png',
    provinces: [Province.BC],
    location: 'Vancouver',
  },
  {
    name: 'Bartons Big Country',
    link: 'bartonsbigcountry.ca',
    logo: 'logo-bartons.png',
    provinces: [Province.AB],
    location: 'Grande Prairie',
  },
  {
    name: 'The Shooting Edge',
    link: 'theshootingedge.com',
    logo: 'shootingedge-logo.png',
    provinces: [Province.AB],
    location: 'Calgary',
  },
  {
    name: 'Lanz Shooting Supplies',
    link: 'lanzshootingsupplies.com',
    logo: 'lanz-logo.png',
    provinces: [Province.ON],
    location: 'St Ann',
  },
  {
    name: 'Durham Outdoors',
    link: 'durhamoutdoors.ca',
    logo: 'duram-logo.png',
    provinces: [Province.ON],
    location: 'Orono',
  },
  {
    name: 'Soley Outdoors',
    link: 'solelyoutdoors.com',
    logo: 'soley-logo.png',
    provinces: [Province.ON],
    location: 'Markham',
  },
  {
    name: 'North Pro Sports',
    link: 'northprosports.com',
    logo: 'northpro-logo.png',
    provinces: [Province.SK],
    location: 'Saskatoon',
    background: true,
  },
  {
    name: 'Wanstalls',
    link: 'wanstallsonline.com',
    logo: 'wanstalls.png',
    provinces: [Province.BC],
    location: 'Maple Ridge',
  },
  {
    name: 'Gothic Line Armoury',
    link: 'gothiclinearmoury.ca',
    logo: 'gothic-line-armoury.jpg',
    provinces: [Province.AB],
    location: 'Calagary',
  },
  {
    name: 'Rampart',
    link: 'rampartcorp.com',
    logo: 'rampart.png',
    provinces: [Province.ON],
    location: 'Ottawa',
    background: true,
  },
  {
    name: 'West Coast Hunting Supplies',
    link: 'westcoasthunting.ca',
    logo: 'westcoasthunting-logo.png',
    provinces: [Province.BC],
    location: 'Richmond',
  },
  {
    name: 'Siwash Sports',
    link: 'siwashsports.ca',
    logo: 'siwash-sports-logo.png',
    provinces: [Province.BC],
    location: 'Chilliwack',
  },
  {
    name: 'Tillsonburg Gun Shop',
    link: 'tillsonburggunshop.com',
    logo: 'tillsonburg-logo.png',
    provinces: [Province.ON],
    location: 'Tillsonburg',
  },
  {
    name: 'CRAFM',
    link: 'crafm.com',
    logo: 'crafm-logo.png',
    provinces: [Province.QC],
    location: 'Montréal',
  },
  {
    name: 'Northern Elite Firearms',
    link: 'northernelitefirearms.ca',
    logo: 'northern-elite-firearms-logo.png',
    provinces: [Province.SK],
    location: 'Prince Albert',
  },
  {
    name: 'Canadian GunHub',
    link: 'gun-hub.mybigcommerce.com',
    logo: 'canadian-gunhub-logo.png',
    provinces: [Province.AB],
    location: 'Dunmore',
  },
  {
    name: 'Budget Shooter Supply',
    link: 'budgetshootersupply.ca',
    logo: 'budgetshootersupply-logo.png',
    provinces: [Province.BC],
    location: 'Surrey',
  },
  {
    name: 'Rusty Wood',
    link: 'rustywood.ca',
    logo: 'rustywood-logo.png',
    provinces: [Province.BC],
    location: 'Mission',
  },
  {
    name: 'The Gun Dealer',
    link: 'thegundealer.net',
    logo: 'thegundealer-logo.png',
    provinces: [Province.NB],
    location: 'McAdam',
  },
  {
    name: 'WASP Munitions',
    link: 'waspmunitions.ca',
    logo: 'waspmunitions-logo.png',
    provinces: [Province.AB],
    location: 'Sylvan Lake',
  },
  {
    name: 'Great North Precision',
    link: 'greatnorthprecision.com',
    logo: 'greatnorthprecision-logo.png',
    provinces: [Province.BC],
    location: 'Kelowna',
  },
  {
    name: 'Tesro',
    link: 'tesro.ca',
    logo: 'tesro-logo.png',
    provinces: [Province.ON],
    location: 'Ottawa',
  },
  {
    name: 'Xmetal Targets',
    link: 'xmetaltargets.com',
    logo: 'xmetaltargets-logo.png',
    provinces: [Province.QC],
    location: `L'Isle-Verte`,
  },
  {
    name: 'Triggers & Bows',
    link: 'triggersandbows.com',
    logo: 'triggers&bows-logo.png',
    provinces: [Province.ON],
    location: 'Burford',
    background: true,
  },
  {
    name: 'G4C',
    link: 'g4cgunstore.com',
    logo: 'g4c-logo.png',
    provinces: [Province.ON],
    location: `Markham`,
  },
  BACK_COUNTRY_SPORTS as IVendor,
  SYLVESTRE_SPORTING_GOODS as IVendor,
  LONDEROS_SPORTS as IVendor,
  NORDIC_MARKSMAN as IVendor,
  PROPHET_RIVER as IVendor,
].map(i => {
  i.logo = '/logos/' + i.logo
  i.background = i.background || false
  i.hasReloadingItems = i.hasReloadingItems || false
  return i as IVendor
})

// list of domain names of all vendors (with www omitted)
/**
 * name of vendors (as shown to user)
 */
export const VENDOR_NAMES = VENDORS.map(v => v.name)

/**
 * domains of all vendors
 */
export const SOURCES = VENDORS.map(v => v.link)

export const PROXY_URL = 'https://ammobin.ca/images'
export const DATE_FORMAT = 'YYYY-MM-DD'
export const CACHE_REFRESH_HOURS = 4

export const RENDERTRON_URL = 'http://rendertron:3000'

export const AMMO_TYPES: ItemType[] = [ItemType.centerfire, ItemType.rimfire, ItemType.shotgun]
export const RELOAD_TYPES: ItemType[] = [ItemType.case, ItemType.powder, ItemType.primer, ItemType.shot]

export const TYPES: ItemType[] = [...AMMO_TYPES, ...RELOAD_TYPES]
