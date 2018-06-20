const QUEUE_NAME = 'SCRAPE_QUEUE';

const SOURCES = [
  'canadiantire.ca',
  'sail.ca',
  'alflahertys.com',
  'firearmsoutletcanada.com',
  'bullseyelondon.com',
  'reliablegun.com',
  'cabelas.ca', // blocked 2018-06-02
  // 'gotenda.com', // disabled 2018-05-08
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
];

const PROXY_URL = 'https://images.ammobin.ca';
const DATE_FORMAT = 'YYYY-MM-DD';
const CACHE_REFRESH_HOURS = 4;

module.exports = { QUEUE_NAME, SOURCES, PROXY_URL, DATE_FORMAT, CACHE_REFRESH_HOURS };
