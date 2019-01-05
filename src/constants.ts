import { IVendor } from './graphql-types'
export const QUEUE_NAME = 'SCRAPE_QUEUE'

export const SOURCES = [
  'canadiantire.ca',
  'sail.ca',
  'alflahertys.com',
  'firearmsoutletcanada.com',
  'bullseyelondon.com',
  'reliablegun.com',
  'cabelas.ca',
  'gotenda.com',
  'canadaammo.com',
  'wolverinesupplies.com',
  'jobrookoutdoors.com',
  'theammosource.com',
  'hirschprecision.com',
  'gun-shop.ca',
  'tigerarms.ca',
  'magdump.ca',
  'rangeviewsports.ca',
  'frontierfirearms.ca',
  'tradeexcanada.com',
  'bvoutdoors.com',
  'nasgunsandammo.com',
  'dantesports.com',
  'leverarms.com',
  'store.theshootingcentre.com',
  'westernmetal.ca',
  'alsimmonsgunshop.com',
  'vancouvergunstore.ca',
  'bartonsbigcountry.ca',
  'theshootingedge.com',
  'lanzshootingsupplies.com',
  'durhamoutdoors.ca',
  'solelyoutdoors.com',
  'northprosports.com',
  'wanstallsonline.com',
  'gothiclinearmoury.ca',
]

export const VENDORS = [
  // todo: take info from above + client
  {
    name: "Cabela's",
    link: 'http://www.cabelas.ca/',
    logo: '/assets/cabelas-logo.png',
    provinces: ['BC', 'AB', 'SK', 'MB', 'ON'],
    location: 'all over the place',
  } as IVendor,
  {
    name: 'Sail',
    link: 'https://www.sail.ca/',
    logo: '/assets/sail-logo.png',
    provinces: ['ON', 'QC'],
    location: 'all over the place',
  },
  {
    name: 'Firearms Outlet Canada',
    link: 'http://www.firearmsoutletcanada.com/',
    logo: '/assets/foc-logo.jpg',
    provinces: ['ON'],
    location: 'Ajax',
  },
  {
    name: "Al Flaherty's",
    link: 'https://www.alflahertys.com/',
    logo: '/assets/al-flahertys-logo.png',
    provinces: ['ON'],
    location: 'Toronto',
  },
  {
    name: 'Bulls Eye London',
    link: 'http://www.bullseyelondon.com/',
    logo: '/assets/bulls-logo.png',
    provinces: ['ON'],
    location: 'London',
  },
  {
    name: 'Canadian Tire',
    link: 'http://www.canadiantire.ca/en/sports-rec/hunting/ammunition.html',
    logo: '/assets/canadian-tire-logo.png',
    provinces: [
      'YT',
      'NT',
      'BC',
      'AB',
      'SK',
      'MB',
      'ON',
      'QC',
      'NB',
      'PE',
      'NS',
      'NF',
    ],
    location: 'all over the place',
  },
  {
    name: 'Reliable Gun',
    link: 'https://www.reliablegun.com/',
    logo: '/assets/reliable-gun-logo.jpg',
    provinces: ['BC'],
    location: 'Vancover',
  },
  {
    name: 'Tenda',
    link: 'https://www.gotenda.com/',
    logo: '/assets/tenda-logo.png',
    provinces: ['ON'],
    location: 'Richmond Hill',
  },
  {
    name: 'Canada Ammo',
    link: 'https://www.canadaammo.com/',
    logo: '/assets/canada-ammo-logo.jpg',
    provinces: ['BC', 'ON'],
    location: 'all over the place',
  },
  {
    name: 'Wolverine Supplies',
    link: 'https://www.wolverinesupplies.com/',
    logo: '/assets/wolverine-logo.png',
    provinces: ['MB'],
    location: 'Virden',
  },
  {
    name: 'Jo Brook Outdoors',
    link: 'https://www.jobrookoutdoors.com/',
    logo: '/assets/jo-brook-logo.png',
    provinces: ['MB'],
    location: 'Brandon',
  },
  {
    name: 'The Ammo Source',
    link: 'http://www.theammosource.com/',
    logo: '/assets/the-ammo-source-logo.png',
    provinces: ['ON'],
    location: 'Harrowsmith',
  },
  {
    name: 'Hirsch Precision',
    link: 'http://www.hirschprecision.com/',
    logo: '/assets/hirsch-logo.png',
    provinces: ['NS'],
    location: 'Lake Echo',
  },
  {
    name: 'Wild West',
    link: 'https://gun-shop.ca/',
    logo: '/assets/wild.png',
    provinces: ['AB'],
    location: 'Edmonton',
  },
  {
    name: 'Tiger Arms',
    link: 'http://www.tigerarms.ca/',
    logo: '/assets/tigerarms.png',
    provinces: ['BC'],
    location: 'Port Coquitlam',
    background: true,
  },
  {
    name: 'Mag Dump',
    link: 'https://magdump.ca/',
    logo: '/assets/magdump-logo.png',
    provinces: ['AB'],
    location: 'Sherwood Park',
  },
  {
    name: 'Rangeview Sports',
    link: 'https://www.rangeviewsports.ca/',
    logo: '/assets/rangeview-sports.png',
    provinces: ['ON'],
    location: 'Newmarket',
  },
  {
    name: 'Trade Ex Canada',
    link: 'https://www.tradeexcanada.com/',
    logo: '/assets/tradex-logo.png',
    provinces: ['ON'],
    location: 'Hawkesburry',
  },
  {
    name: 'Frontier Firearms',
    link: 'http://frontierfirearms.ca/',
    logo: '/assets/frontierfirearms-logo.png',
    provinces: ['SK'],
    location: 'Prince Albert',
  },
  {
    name: 'BV Outdoor Essentials',
    link: 'https://www.bvoutdoors.com/',
    logo: '/assets/bvoutdoors-logo.png',
    provinces: ['BC'],
    location: 'Smithers',
  },
  {
    name: 'NAS Guns & Ammo',
    link: 'https://www.nasgunsandammo.com/',
    logo: '/assets/nas-logo.jpg',
    provinces: ['ON'],
    location: 'Niagara and Sault Ste. Marie',
  },
  {
    name: 'Dante Sports',
    link: 'https://www.dantesports.com/en/',
    logo: '/assets/dante-logo.png',
    provinces: ['QC'],
    location: 'Montréal',
  },
  {
    name: 'Lever Arms',
    link: 'https://www.leverarms.com/',
    logo: '/assets/leverarms-logo.png',
    provinces: ['BC'],
    location: 'Vancouver',
  },
  {
    name: 'Calgary Shooting Center',
    link: 'https://store.theshootingcentre.com/',
    logo: '/assets/shooting-center-logo.jpg',
    provinces: ['AB'],
    location: 'Calgary',
  },
  {
    name: 'Western Metal',
    link: 'https://www.westernmetal.ca/shooting',
    logo: '/assets/westernmetal-logo.png',
    provinces: ['AB'],
    location: 'somewhere',
  },
  {
    name: 'Al Simmons',
    link: 'https://alsimmonsgunshop.com/',
    logo: '/assets/al-simmons-logo.jpg',
    provinces: ['ON'],
    location: 'Hamilton',
  },
  {
    name: 'Vancouver Gun Store',
    link: 'https://vancouvergunstore.ca/',
    logo: '/assets/vancouvergunstore-logo.png',
    provinces: ['BC'],
    location: 'Vancouver',
  },
  {
    name: 'Bartons Big Country',
    link: 'https://www.bartonsbigcountry.ca/',
    logo: '/assets/logo-bartons.png',
    provinces: ['AB'],
    location: 'Grande Prairie',
  },
  {
    name: 'The Shooting Edge',
    link: 'https://theshootingedge.com/',
    logo: '/assets/shootingedge-logo.png',
    provinces: ['AB'],
    location: 'Calgary',
  },
  {
    name: 'Lanz Shooting Supplies',
    link: 'http://www.lanzshootingsupplies.com/',
    logo: '/assets/lanz-logo.png',
    provinces: ['ON'],
    location: 'St Ann',
  },
  {
    name: 'Duram Outdoors',
    link: 'https://durhamoutdoors.ca/',
    logo: '/assets/duram-logo.png',
    provinces: ['ON'],
    location: 'Orono',
  },
  {
    name: 'Soley Outdoors',
    link: 'https://www.solelyoutdoors.com/',
    logo: '/assets/soley-logo.png',
    provinces: ['ON'],
    location: 'Markham',
  },
  {
    name: 'North Pro Sports',
    link: 'http://northprosports.com/',
    logo: '/assets/northpro-logo.png',
    provinces: ['SK'],
    location: 'Saskatoon',
    background: true,
  },
  {
    name: 'Wanstalls',
    link: 'https://www.wanstallsonline.com',
    logo: '/assets/wanstalls.png',
    provinces: ['BC'],
    location: 'Maple Ridge',
  },
  {
    name: 'Gothic Line Armoury',
    link: 'https://gothiclinearmoury.ca',
    logo: '/assets/gothic-line-armoury.jpg',
    provinces: ['AB'],
    location: 'Calagary',
  },
]

export const PROXY_URL = 'https://ammobin.ca/images'
export const DATE_FORMAT = 'YYYY-MM-DD'
export const CACHE_REFRESH_HOURS = 4