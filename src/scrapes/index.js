import { duration } from 'moment';

const axios = require('axios');
const version = require('../../package.json').version;
const axiosVersion = require('../../node_modules/axios/package.json').version;
axios.defaults.headers.common['User-Agent'] = `AmmoBin.ca/${version} (nodejs; Linux x86_64) axios/${axiosVersion}`; // be a

const cabelas = require('./cabelas-api');
const canadiantire = require('./canadian-tire');
const wolverinesupplies = require('./wolverine-api');
const theAmmoSource = require('./the-ammo-source');
const hirsch = require('./hirschprecision');
const wildWest = require('./wild-west');
const tigerArms = require('./tiger-arms');
const magdump = require('./mapdump');
const rangeviewsports = require('./rangeviewsports');
const jobrook = require('./jo-brook');
const faoc = require('./faoc');
const alflahertys = require('./alflahertys');
const bullseyelondon = require('./bullseyelondon');
const sail = require('./sail');
const reliablegun = require('./reliablegun');
const tenda = require('./tenda');
const canadaammo = require('./canadaammo');
const frontierfirearms = require('./frontierfirearms');
const tradex = require('./tradex');
const bvoutdoors = require('./bvoutdoors');
const nas = require('./nas');
const dante = require('./dante');
const leverarms = require('./leverarms');
const theShootingCenter = require('./the-shooting-center');
const westernMetal = require('./western-metal');
const alsimmons = require('./al-simmons')
const vancouvergunstore = require('./vacovergunstore')
const barton = require('./barton')
const shootingEdge = require('./shooting-edge')
const lanz = require('./lanz')
const durham = require('./durhamoutdoors')

function makeSearch(source, type) {
  switch (source) {
    case 'cabelas.ca':
      return cabelas(type);

    case 'firearmsoutletcanada.com':
      return faoc(type);

    case 'alflahertys.com':
      return alflahertys(type);

    case 'bullseyelondon.com':
      return bullseyelondon(type);

    case 'sail.ca':
      return sail(type);

    case 'reliablegun.com':
      return reliablegun(type);

    case 'canadiantire.ca':
      return canadiantire(type);

    case 'gotenda.com':
      return tenda(type);

    case 'canadaammo.com':
      return canadaammo(type);

    case 'jobrookoutdoors.com':
      return jobrook(type);

    case 'theammosource.com':
      return theAmmoSource(type);

    case 'hirschprecision.com':
      return hirsch(type);

    case 'gun-shop.ca':
      return wildWest(type);

    case 'tigerarms.ca':
      return tigerArms(type);

    case 'magdump.ca':
      return magdump(type);

    case 'rangeviewsports.ca':
      return rangeviewsports(type);

    case 'wolverinesupplies.com':
      return wolverinesupplies(type);

    case 'frontierfirearms.ca':
      return frontierfirearms(type);

    case 'tradeexcanada.com':
      return tradex(type);

    case 'bvoutdoors.com':
      return bvoutdoors(type);

    case 'nasgunsandammo.com':
      return nas(type);

    case 'dantesports.com':
      return dante(type);

    case 'leverarms.com':
      return leverarms(type);

    case 'store.theshootingcentre.com':
      return theShootingCenter(type);

    case 'westernmetal.ca':
      return westernMetal(type);

    case 'alsimmonsgunshop.com':
      return alsimmons(type);

    case 'vancouvergunstore.ca':
      return vancouvergunstore(type);

    case 'bartonsbigcountry.ca':
      return barton(type);

    case 'theshootingedge.com':
      return shootingEdge(type);

    case 'lanzshootingsupplies.com':
      return lanz(type)

    case 'durhamoutdoors.ca':
      return durham(type)

    default:
      throw new Error(`unknown source: ${source} + type: ${type}`);
  }
}

module.exports = makeSearch;
