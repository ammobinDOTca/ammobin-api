import { IVendor, Province, ItemType } from './graphql-types'
import { getRegion, getStage } from './env'
import {
  BACK_COUNTRY_SPORTS,
  SYLVESTRE_SPORTING_GOODS,
  LONDEROS_SPORTS,
  NORDIC_MARKSMAN,
  PROPHET_RIVER,
  MARSTAR,
  NAS,
  BULLS_EYE,
  NICKS_SPORTS,
  CANADA_FIRST_AMMO,
  TENDA,
  GREAT_NORTH_PRECISION,
  // PRECISION_OPTICS,
} from './vendors'
import { BOTACH, BROWNELLS, GORILLA } from './vendors-us'
export const QUEUE_NAME = 'SCRAPE_QUEUE'

const region = getRegion()

export const VENDORS: IVendor[] = (region === 'CA'
  ? [
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
      TENDA as IVendor,
      // 20200119: cert issues
      // {
      //   name: 'Canada Ammo',
      //   link: 'canadaammo.com',
      //   logo: 'canada-ammo-logo.jpg',
      //   provinces: [Province.BC, Province.ON],
      //   location: 'all over the place',
      // },
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
      //  april 2020 ammo no longer listed on site
      // {
      //   name: 'Al Simmons',
      //   link: 'alsimmonsgunshop.com',
      //   logo: 'al-simmons-logo.jpg',
      //   provinces: [Province.ON],
      //   location: 'Hamilton',
      // },
      // site offline feb 2020
      // {
      //   name: 'Vancouver Gun Store',
      //   link: 'vancouvergunstore.ca',
      //   logo: 'vancouvergunstore-logo.png',
      //   provinces: [Province.BC],
      //   location: 'Vancouver',
      // },
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
      // 20200422 no longer selling ammo
      // {
      //   name: 'Rampart',
      //   link: 'rampartcorp.com',
      //   logo: 'rampart.png',
      //   provinces: [Province.ON],
      //   location: 'Ottawa',
      //   background: true,
      // },
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
      GREAT_NORTH_PRECISION as IVendor,
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
      MARSTAR as IVendor,
      NAS as IVendor,
      BULLS_EYE as IVendor,
      NICKS_SPORTS as IVendor,
      CANADA_FIRST_AMMO as IVendor,
      // PRECISION_OPTICS as IVendor, // 20200101 their html is too silly to deal with..
    ]
  : ([BOTACH, BROWNELLS, GORILLA] as IVendor[])
).map((i) => {
  i.logo = '/logos/' + i.logo
  i.background = i.background || false
  i.hasReloadingItems = i.hasReloadingItems || false
  return i as IVendor
})

/**
 * name of vendors (as shown to user)
 */
export const VENDOR_NAMES = VENDORS.map((v) => v.name)

/**
 * domains of all vendors
 */
export const SOURCES = VENDORS.map((v) => v.link)

const stage = getStage()

export const PROXY_URL = `https://${stage === 'beta' ? 'beta.' : ''}ammobin.${region.toLowerCase()}/images`

export const DATE_FORMAT = 'YYYY-MM-DD'
export const CACHE_REFRESH_HOURS = 4

export const RENDERTRON_URL = 'http://rendertron:3000'

export const AMMO_TYPES: ItemType[] = [ItemType.centerfire, ItemType.rimfire, ItemType.shotgun]
export const RELOAD_TYPES: ItemType[] = [ItemType.case, ItemType.powder, ItemType.primer, ItemType.shot]

export const TYPES: ItemType[] = [...AMMO_TYPES, ...RELOAD_TYPES]
