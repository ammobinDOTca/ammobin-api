const axios = require('axios');
const version = require('../../package.json').version;
const axiosVersion = require('../../node_modules/axios/package.json').version;
axios.defaults.headers.common['User-Agent'] = `AmmoBin.ca/${version} (nodejs; Linux x86_64) axios/${axiosVersion}`; // be a
axios.defaults.headers.common['Referer'] = `ammobin.ca`;

const cabelas = require('./cabelas-api');
const canadiantire = require('./canadian-tire');
const wolverinesupplies = require('./wolverine-api');
const theAmmoSource = require('./the-ammo-source');
const hirsch = require('./hirschprecision');
const wildWest = require('./wild-west');
const tigerArms = require('./tiger-arms');
const magdump = require('./magdump');
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
const soley = require('./soley-outdoors')
const northpro = require('./northpro')
const wanstall = require('./wanstalls')

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

    case 'solelyoutdoors.com':
      return soley(type)

    case 'northprosports.com':
      return northpro(type)

    case 'wanstallsonline.com':
      return wanstall(type)

    default:
      throw new Error(`unknown source: ${source} + type: ${type}`);
  }
}

module.exports = makeSearch;
