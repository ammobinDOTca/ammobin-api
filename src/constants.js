const QUEUE_NAME = 'SCRAPE_QUEUE';

const SOURCES = [
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
];

const PROXY_URL = 'https://images.ammobin.ca';
const DATE_FORMAT = 'YYYY-MM-DD';
const CACHE_REFRESH_HOURS = 4;

module.exports = { QUEUE_NAME, SOURCES, PROXY_URL, DATE_FORMAT, CACHE_REFRESH_HOURS };
