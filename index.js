'use strict';

const Hapi = require('hapi');
const redis = require('redis');
const hapiCron = require('hapi-cron');
const moment = require('moment');
const boom = require('boom');
const url = require('url');
const classifier = require('ammobin-classifier');

const axios = require('axios');
const version = require('./package.json').version;
const axiosVersion = require('./node_modules/axios/package.json').version;
axios.defaults.headers.common['User-Agent'] = `AmmoBin.ca/${version} (nodejs; Linux x86_64) axios/${axiosVersion}`; // be a nice web citizen and tell people who we are..


const client = redis.createClient({ host: 'redis' });
const influx = require('./influx');

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

const helpers = require('./helpers');

const PROXY_URL = 'https://images.ammobin.ca';
const DATE_FORMAT = 'YYYY-MM-DD';

function proxyImages(items) {
  return items.map(i => {
    if (!i.img) {
      return i;
    }

    if (i.img.indexOf('//') === 0) {
      i.img = 'http://' + i.img;
    }
    i.img = PROXY_URL + '/x160/' + i.img;
    return i;
  })
}

function addSrcRefToLinks(items) {
  return items.map(i => {
    if (!i.link) {
      return i;
    }

    if (i.link.indexOf('?') === -1) {
      i.link += '?'
    } else {
      i.link += '&'
    }
    i.link = `https://api.ammobin.ca/track-outbound-click?url=${encodeURIComponent(i.link + 'utm_source=ammobin.ca')}`;
    return i;
  });
}


function classifyBrand(items) {
  return items.map(i => {
    i.brand = classifier.classifyBrand(i.brand || i.name || '')
    return i;
  });
}

function getCounts(items) {
  return items.map(i => {
    i.count = isNaN(i.count) ? classifier.getItemCount(i.name) || '' : i.count;
    if (i.count > 1) {
      i.unitCost = i.price / i.count;
      if (i.unitCost < 0.01) {
        i.unitCost = null; // something went wrong with the classifier
      }
    } else {
      i.unitCost = null;
    }
    return i;
  });
}

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

    default:
      throw new Error(`unknown source: ${source} + type: ${type}`);
  }
}

function getItems(source, type) {
  const key = `${moment.utc().format(DATE_FORMAT)}_${source}_${type}`;
  return new Promise((resolve, reject) => {
    client.get(key, (err, res) => {
      if (err) {
        return reject(err);
      } else if (res) {
        return resolve(JSON.parse(res));
      } else {
        console.log('making scrape for ', source, type, new Date());

        makeSearch(source, type)
          .then(classifyBrand)
          .then(i => proxyImages(i))
          .then(i => addSrcRefToLinks(i))
          .then(getCounts)
          .then(items => {

            if (items.length) {
              console.log(`found ${items.length} ${source} ${type}`);
            } else {
              console.warn(`WARN: no results for ${source} ${type}`, new Date())
            }

            client.set(key, JSON.stringify(items), 'EX', 172800 /*seconds => 48hrs*/, (err) => {
              if (err) {
                return reject(err);
              }
              return resolve(items);
            })
          })
          .catch(e => {
            console.error(`ERROR: failed to load ${source} ${type} => ${e}`);
            resolve([]);// let other stuff work
          });
      }
    })
  });

}

const SOURCES = [
  // 'canadiantire.ca',
  // 'sail.ca',
  'alflahertys.com',
  'firearmsoutletcanada.com',
  'bullseyelondon.com',
  'reliablegun.com',
  'cabelas.ca',
  'gotenda.com',
  'canadaammo.com',
  'wolverinesupplies.com',
  // 'jobrookoutdoors.com',
  'theammosource.com',
  // 'hirschprecision.com',
  'gun-shop.ca',
  'tigerarms.ca',
  'magdump.ca',
  'rangeviewsports.ca',
  'frontierfirearms.ca',
  'tradeexcanada.com',
  'bvoutdoors.com',
];


// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  host: '0.0.0.0',
  port: 8080,
  routes: { cors: true }
});

// Add the route
server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    reply('hi');
  }
});

server.route({
  method: 'GET',
  path: '/track-outbound-click',
  handler: function (request, reply) {
    if (!request.query.url) {
      return reply(boom.badRequest('missing required param: url'))
    }

    const targetUrl = url.parse(request.query.url);

    const host = targetUrl.hostname ? targetUrl.hostname.replace('www.', '') : '';
    if (SOURCES.indexOf(host) === -1) {
      return reply(boom.badRequest('invalid target url'));
    }
    const date = moment.utc().format(DATE_FORMAT);

    return new Promise((resolve, reject) =>
      client.mget([
        'rimfire',
        'shotgun',
        'centerfire'
      ].map(type => `${date}_${host}_${type}`), (err, res) => err ? reject(err) : resolve(res.map(JSON.parse))))
      .then(helpers.combineResults)
      .then(results => {
        const encoded = encodeURIComponent(request.query.url)
        const record = results.find(r => r && r.link.indexOf(encoded));

        if (!record) {
          console.warn('WARN: unable to find matching record for ' + request.query.url);
        }

        return influx.logClick(request.query.url, request.headers['user-agent'], record ? record : {});
      })
      .then(() => {
        return reply
          .redirect(request.query.url);
      });
  }
})

server.route({
  method: 'GET',
  path: '/dank',
  handler: function (request, reply) {
    const day = moment.utc().format('YYYY-MM-DD');

    const keys = SOURCES.map(s => `${day}_${s}_centerfire`)
    return new Promise((resolve, reject) => {
      client.mget(keys, (err, res) => err ? reject(err) : resolve(res.map(r => r ? JSON.parse(r) : null)))
    })
      .then(results => {
        const result = results.reduce((final, result) => {
          return final.concat(result || []);
        }, [])
          .filter(r => r && (r.price > 0) && r.calibre === 'UNKNOWN')
          .sort(function (a, b) {
            if (a.price > b.price) {
              return 1
            } else if (a.price < b.price) {
              return -1;
            } else {
              return 0;
            }
          });
        return reply(result);
      })
  }
});

server.route({
  method: 'GET',
  path: '/best-popular-prices',
  handler: function (request, reply) {
    const day = moment.utc().format('YYYY-MM-DD');

    const keys = SOURCES.map(s => `${day}_${s}_centerfire`)
    return new Promise((resolve, reject) =>
      client.mget(keys, (err, res) => err ? reject(err) : resolve(res))
    )
      .then(res => res.map(r => r ? JSON.parse(r) : null))

      .then(results => {
        const result = results.reduce((final, result) => {
          return result && result.length ? final.concat(result) : final;
        }, [])
          .reduce((response, item) => {
            if (!item || !item.calibre || !item.unitCost || item.calibre === 'UNKNOWN') {
              return response;
            }

            if (!response[item.calibre]) {
              response[item.calibre] = Number.MAX_SAFE_INTEGER;
            }

            response[item.calibre] = Math.min(response[item.calibre], item.unitCost);

            return response;
          }, {});

        reply(result);
      })
      .catch(e => console.error(e))
  }
})

// Add the route
server.route({
  method: 'GET',
  path: '/{type}',
  handler: function (request, reply) {

    const type = request.params.type;
    if (['rimfire', 'centerfire', 'shotgun'].indexOf(type) === -1) {
      console.log('unknown type', type)
      return reply(boom.badRequest('invalid type: ' + type));
    }

    return Promise.all(SOURCES.map(s => getItems(s, type)))
      .then(results => {
        const result = results.reduce((final, result) => {
          return final.concat(result);
        }, [])
          .filter(r => r && (r.price > 0) && r.calibre && r.calibre !== 'UNKNOWN')
          .sort(function (a, b) {
            if (a.price > b.price) {
              return 1
            } else if (a.price < b.price) {
              return -1;
            } else {
              return 0;
            }
          });
        if (result.length === 0) {
          console.log('didnt get any results. shit be broke');
        }

        const itemsGrouped = result.reduce((r, item) => {
          const key = item.calibre + '_' + item.brand;
          if (!r[key]) {
            r[key] = {
              name: `${item.brand} ${item.calibre}`,
              calibre: item.calibre,
              brand: item.brand,
              minPrice: item.price,
              maxPrice: item.price,
              minUnitCost: item.unitCost || 0,
              maxUnitCost: item.unitCost || 0,
              img: item.img,
              vendors: [
                item
              ]
            };
          } else {
            const val = r[key];
            val.minPrice = Math.min(item.price, val.minPrice);
            val.maxPrice = Math.max(item.price, val.maxPrice);

            if (item.unitCost) {
              if (val.minUnitCost === 0) {
                val.minUnitCost = item.unitCost;
              }
              val.minUnitCost = Math.min(item.unitCost, val.minUnitCost);
              val.maxUnitCost = Math.max(item.unitCost, val.maxUnitCost);
            }


            val.img = val.img || item.img;
            val.vendors.push(item);

          }
          return r;
        }, {});

        reply(Object.keys(itemsGrouped).map(k => itemsGrouped[k]));

      })
      .catch(e => {
        console.error('ERROR: failed to load ammo list', e);
        reply(`failed to load ammo lists. ${e}`);
      });
  }
});

server.register({
  register: hapiCron,
  options: {
    jobs: ['rimfire', 'shotgun', 'centerfire'].map((t, index) => ({
      name: 'load_' + t,
      time: `${index * 15} 7 * * * *`,
      timezone: 'America/Toronto',
      request: {
        method: 'GET',
        url: `/${t}`
      },
      callback: () => {
        console.info(new Date(), `load_${t} has run!`);
      }
    }))
  }
}, (err) => {

  if (err) {
    return console.error(err);
  }

  server.start((e) => {
    if (e) {
      throw e;
    }
    console.info(`Server started at ${server.info.uri}`);
  });
});

server.on('response', function (request) {
  console.log(`${request.info.remoteAddress}: ${request.method.toUpperCase()} ${request.url.path} --> ${request.response.statusCode} ${new Date().getTime() - request.info.received}ms`)

});
