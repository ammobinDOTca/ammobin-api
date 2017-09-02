'use strict';

const Hapi = require('hapi');
const redis = require('redis');
const hapiCron = require('hapi-cron');
const moment = require('moment');
const boom = require('boom');
const url = require('url');
const classifier = require('ammobin-classifier');
const throat = require('throat');

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
const CACHE_REFRESH_HOURS = 4;
const secretRefreshKey = Math.random().toString(); // required to only allow us to refresh the cache on our terms
console.log('secretRefreshKey', secretRefreshKey)

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

function getKey(source, type) {
  return `${moment.utc().format(DATE_FORMAT)}_${source}_${type}`;
}

function getItems(source, type) {

  console.log('making scrape for ', source, type, new Date());
  return makeSearch(source, type)
    .then(classifyBrand)
    .then(i => proxyImages(i))
    .then(i => addSrcRefToLinks(i))
    .then(getCounts)
    .then(items => items.filter(i => i.price))
    .then(items => {

      if (items.length) {
        console.log(`found ${items.length} ${source} ${type}`);
      } else {
        console.warn(`WARN: no results for ${source} ${type}`, new Date())
      }

      const key = getKey(source, type);
      return new Promise((resolve, reject) => client.set(key, JSON.stringify(items), 'EX', 172800 /*seconds => 48hrs*/, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve(items);
      }));
    })
    .catch(e => {
      console.error(`ERROR: failed to load ${source} ${type} => ${e && e.message ? e.message : e}`);
    });
}

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
];


const server = new Hapi.Server({
  cache: [
    {
      engine: require('catbox-redis'),
      host: 'redis',
      partition: 'cache'
    }
  ]
});

server.connection({
  host: '0.0.0.0',
  port: 8080,
  routes: { cors: true }
});

const classifiedListsCache = server.cache({
  expiresIn: (CACHE_REFRESH_HOURS + 2) * 60 * 1000,// make sure that this can stay around till after the next refresh cycle
  segment: 'classifiedLists',
  generateFunc: function (type, next) {
    // pull everything out of cache
    const keys = SOURCES.map(s => getKey(s, type));

    return new Promise((resolve, reject) =>
      client.mget(keys, (err, res) => err ? reject(err) : resolve(res.map(r => r ? JSON.parse(r) : null)))
    )
      .then(results => {
        const result = results
          .reduce((final, r) => r
            ? final.concat(r)
            : final,
          [])
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
          console.log('did not get any results. shit must be broke');
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
        const response = Object.keys(itemsGrouped).map(k => itemsGrouped[k]);
        next(null, response);
      });
  },
  generateTimeout: 6000
});

const bestPricesCache = server.cache({
  expiresIn: (CACHE_REFRESH_HOURS * 2) * 60 * 1000, // make sure that this can stay around till after the next refresh cycle
  segment: 'bestPrices',
  generateFunc: function (id, next) {
    const keys = SOURCES.map(s => getKey(s, 'centerfire'));
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

        next(null, result);
      });
  },
  generateTimeout: 5000
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
    const keys = SOURCES.map(s => getKey(s, 'centerfire'));
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
    bestPricesCache.get('centerfire', (err, res) => {
      if (err) {
        console.error('ERROR: cache failed', err);
        return reply(boom.serverUnavailable('failed to load best popular prices from cache'));
      } else {
        return reply(res);
      }
    })
  }
})

server.route({
  method: 'GET',
  path: '/refresh-cache',
  handler: function (req, reply) {

    const type = req.query.type;
    console.log(req.query['secret-refresh-key'], secretRefreshKey)

    if (req.query['secret-refresh-key'] !== secretRefreshKey) {
      return reply(boom.badRequest('fuck off. you dont have my super secret code...'))
    } else if (['rimfire', 'centerfire', 'shotgun'].indexOf(type) === -1) {
      return reply(boom.badRequest('invalid type: ' + type));
    }

    const throttle = throat(1); // make it REALLY slow so we dont run out of memory
    return Promise.all(SOURCES.map(s => throttle(() => getItems(s, type))))
      .then(() => new Promise((resolve, reject) =>
        classifiedListsCache.drop(type, (e, r) => e ? reject(e) : resolve(r)))
      )
      .then(() => new Promise((resolve, reject) =>
        bestPricesCache.drop(type, (e, r) => e ? reject(e) : resolve(r)))
      )
      .then(() => reply({ message: 'ok' }));
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

    classifiedListsCache.get(type, (err, res) => {
      if (err) {
        console.error('ERROR: cache failed', err);
        return reply(boom.serverUnavailable('failed to load items from cache'));
      } else {
        if (res.length === 0) {
          console.warn(`WARN: no cached results for ${type}. dropping the cat box`);
          classifiedListsCache.drop(type);
        }
        return reply(res);
      }
    })
  }
});

server.register({
  register: hapiCron,

  options: {
    jobs: ['rimfire', 'shotgun', 'centerfire'].map((t, index) => ({
      name: 'load_' + t,
      time: `0 ${index * 15} */${CACHE_REFRESH_HOURS} * * *`,
      timezone: 'UTC',
      request: {
        method: 'GET',
        url: `/refresh-cache?type=${t}&secret-refresh-key=${secretRefreshKey}`
      },
      callback: () => {
        console.info(new Date(), `refresh ${t} has run!`);
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
    console.log(classifiedListsCache.isReady())

    console.info(`Server started at ${server.info.uri}`);
  });
});

server.on('response', function (request) {
  console.log(`${request.info.remoteAddress}: ${request.method.toUpperCase()} ${request.url.path} --> ${request.response.statusCode} ${new Date().getTime() - request.info.received}ms`)

});


