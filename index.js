'use strict';

const Hapi = require('hapi');
const axios = require('axios');
const redis = require('redis');
const hapiCron = require('hapi-cron');
const moment = require('moment');
const boom = require('boom');
const url = require('url');
console.time('loadClass')
const classifier = require('ammobin-classifier');
console.timeEnd('loadClass')
const client = redis.createClient({ host: 'redis' });

const wrapAPIKey = require('./wrap-api-key');
const cabelas = require('./cabelas-api');
const makeCanadianTireReq = require('./canadian-tire');
const makeWolverine = require('./wolverine-api');
const theAmmoSource = require('./the-ammo-source');
const hirsch = require('./hirschprecision');
const wildWest = require('./wild-west');

const PROXY_URL = 'https://images.ammobin.ca';

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
    }
    i.link = `https://api.ammobin.ca/track-outbound-click?url=${encodeURIComponent(i.link + 'utm_source=ammobin.ca')}`;
    return i;
  });
}


function classifyRimfire(items) {
  return items.map(i => {
    i.calibre = classifier.classifyRimfire(i.calibre || i.name || '').toUpperCase()
    return i;
  });
}

function classifyCenterfire(items) {
  return items.map(i => {
    i.calibre = classifier.classifyCenterFire(i.calibre || i.name || '').toUpperCase()
    return i;
  });
}

function classifyShotgun(items) {
  return items.map(i => {
    i.calibre = classifier.classifyShotgun(i.calibre || i.name || '').toUpperCase()
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
        i.unitCost = null; // something went wrong with the classifer
      }
    } else {
      i.unitCost = null;
    }
    return i;
  });
}

function getItems(source, type) {
  const key = `${moment.utc().format('YYYY-MM-DD')}_${source}_${type}`;
  return new Promise((resolve, reject) => {
    client.get(key, (err, res) => {
      if (err) {
        return reject(err);
      } else if (res) {
        return resolve(JSON.parse(res));
      } else {
        console.log('making scrape for ', source, type, new Date());
        let prom;

        if (source === 'cabelas') {

          if (type === 'rimfire') {
            prom = cabelas.makeCabelasReq("936").then(classifyRimfire);
          } else if (type === 'shotgun') {
            prom = Promise.all([
              cabelas.makeCabelasReq('928').then(classifyShotgun),
              cabelas.makeCabelasReq('922').then(classifyShotgun),
              cabelas.makeCabelasReq('923').then(classifyShotgun),
              cabelas.makeCabelasReq('924').then(classifyShotgun),
              cabelas.makeCabelasReq('926').then(classifyShotgun),
            ]).then(results => results.reduce((final, r) => final.concat(r), []));
          } else if (type === 'centerfire') {
            prom = Promise.all([
              cabelas.makeCabelasReq('916').then(classifyCenterfire),
              cabelas.makeCabelasCalibre('933', '20476').then(classifyCenterfire), // 223 rem
              cabelas.makeCabelasCalibre('933', '19413').then(classifyCenterfire), // 303 brit
              cabelas.makeCabelasCalibre('933', '20494').then(classifyCenterfire), // 7.62x39
              cabelas.makeCabelasCalibre('933', '20561').then(classifyCenterfire), // 7mm-08
              cabelas.makeCabelasCalibre('933', '20486').then(classifyCenterfire), // 308 wim
              cabelas.makeCabelasCalibre('933', '20483').then(classifyCenterfire), // .30-06 Springfield

            ]).then(results => results.reduce((final, r) => final.concat(r), []));
          }
        } else if (source === 'faoc') {
          function makeFaocReq(ammotype) {
            return axios({
              url: "https://wrapapi.com/use/meta-ammo-ca/faoc/faoc/latest",
              method: 'post',
              data: {
                ammotype,
                wrapAPIKey
              }
            }).then(d => { return d.data.data.items; });
          }
          if (type === 'rimfire') {
            prom = makeFaocReq('rimfire-ammunition').then(classifyRimfire);
          } else if (type === 'centerfire') {
            prom = Promise.all([
              makeFaocReq('rifle-ammunition'),
              makeFaocReq('pistol-ammunition'),
            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyCenterfire);
          } else if (type === 'shotgun') {
            prom = Promise.all([
              makeFaocReq('shotgun-ammuntion')
            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyShotgun);
          }
        } else if (source === 'alflahertys') {
          // -------------------------
          function makeAlReq(ammotype, page = 1) {
            return axios({
              url: "https://wrapapi.com/use/meta-ammo-ca/alflahertys/alflahertys/latest",
              method: 'post',
              data: {
                ammotype,
                page,
                wrapAPIKey
              }
            }).then(d => {
              if (!d.data.data) {
                console.error(`failed to load ${source}:${ammotype}_${page}`, d.data);
                return [];
              }
              console.log(`${source}: loaded ${ammotype} page${d.data.data.page} of ${d.data.data.lastPage}`);
              if (!isNaN(d.data.data.lastPage) && d.data.data.page < d.data.data.lastPage) {
                return new Promise((resolve, reject) => setTimeout(() => resolve(), 1500 + Math.round(100 * Math.random())))
                  .then(() => makeAlReq(ammotype, page + 1))
                  .then(dd => d.data.data.items.concat(dd));
              } else {
                return d.data.data.items;
              }
            });
          }
          if (type === 'rimfire') {
            prom = makeAlReq('Rimfire-Ammo').then(classifyRimfire);
          } else if (type === 'centerfire') {
            prom = Promise.all([
              makeAlReq('Rifle-Ammunition'), // multi page
              makeAlReq('Bulk-Rifle'),
              makeAlReq('Pistol-Ammo'),// multi page
            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyCenterfire);
          } else if (type === 'shotgun') {
            prom = Promise.all([
              makeAlReq('Shotgun-Ammo')// multi page
            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyShotgun);
          }
        } else if (source === 'bullseye') {
          function makeBullsReq(ammotype) {
            return axios({
              url: "https://wrapapi.com/use/meta-ammo-ca/bullseye/bullseye/latest",
              method: 'post',
              data: {
                ammotype,
                wrapAPIKey
              }
            }).then(d => { return d.data.data.items; });
          }
          if (type === 'rimfire') {
            prom = makeBullsReq('rimfire-ammunition').then(classifyRimfire);
          } else if (type === 'centerfire') {
            prom = Promise.all([
              makeBullsReq('pistol-ammunition'),
              makeBullsReq('rifle-ammunition'),
            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyCenterfire);
          } else if (type === 'shotgun') {
            prom = Promise.all([
              makeBullsReq('shotgun')
            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyShotgun);
          }
        } else if (source === 'sail') {
          // -------------------------
          function makeSailReq(ammotype, page = 1) {
            return axios({
              url: "https://wrapapi.com/use/meta-ammo-ca/sail/sail/latest",
              method: 'post',
              data: {
                ammotype,
                page,
                wrapAPIKey
              }
            }).then(d => {

              if (!d.data.data) {
                console.error(`failed to load ${source}:${ammotype}_${page}`, d.data);
                return [];
              }

              console.log(`${source}:  loaded ${ammotype} page${d.data.data.page} of ${d.data.data.lastPage}`);
              if (!isNaN(d.data.data.lastPage) && d.data.data.page < d.data.data.lastPage) {
                return new Promise((resolve, reject) => setTimeout(() => resolve(), 1500 + Math.round(100 * Math.random())))
                  .then(_ => makeSailReq(ammotype, page + 1))
                  .then(dd => d.data.data.items.concat(dd));
              } else {
                return d.data.data.items;
              }

            });
          }
          if (type === 'rimfire') {
            prom = makeSailReq('rimfire').then(classifyRimfire);
          } else if (type === 'centerfire') {
            prom = Promise.all([
              makeSailReq('centerfire'), // multi page
            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyCenterfire);
          } else if (type === 'shotgun') {
            prom = Promise.all([
              makeSailReq('shells-steel'),// multi page
              makeSailReq('shells-lead')// multi page
            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyShotgun);
          }
        } else if (source === 'reliable') {
          // -------------------------
          function makeReliableRequest(ammotype, page = 1) {
            return axios({
              url: "https://wrapapi.com/use/meta-ammo-ca/reliablegun/reliablegun/latest",
              method: 'post',
              data: {
                ammotype,
                page,
                wrapAPIKey
              }
            }).then(d => {

              if (!d.data.data) {
                console.error(`failed to load ${source}:${ammotype}_${page}`, d.data);
                return [];
              }

              console.log(`${source}:  loaded ${ammotype} page${d.data.data.page} of ${d.data.data.lastPage}`);
              if (!isNaN(d.data.data.lastPage) && d.data.data.page < d.data.data.lastPage) {
                return new Promise((resolve) => setTimeout(() => resolve(), 1500 + Math.round(100 * Math.random())))
                  .then(() => makeReliableRequest(ammotype, page + 1))
                  .then(dd => d.data.data.items.concat(dd));
              } else {
                return d.data.data.items;
              }

            });
          }
          if (type === 'rimfire') {
            prom = makeReliableRequest('rimfire-ammunition').then(classifyRimfire);
          } else if (type === 'centerfire') {
            prom = Promise.all([
              makeReliableRequest('rifle-ammunition'), // multi page
              makeReliableRequest('hand-gun-ammunition'), // multi page
            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyCenterfire);
          } else if (type === 'shotgun') {
            prom = Promise.all([
              makeReliableRequest('shotgun-ammunition'),// multi page
            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyShotgun);
          }
        } else if (source === 'canadiantire') {
          if (type === 'rimfire') {
            prom = makeCanadianTireReq('Rimfire Ammunition').then(classifyRimfire);
          } else if (type === 'centerfire') {
            prom = Promise.all([
              makeCanadianTireReq('Centerfire Ammunition'),
            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyCenterfire);
          } else if (type === 'shotgun') {
            prom = Promise.all([
              makeCanadianTireReq('Lead Shotgun Shells'),
              makeCanadianTireReq('Steel Shotgun Shells'),
              makeCanadianTireReq('Slugs & Buckshots'),
            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyShotgun);
          }
        } else if (source === 'tenda') {
          function makeTendaRequest(ammotype) {
            return axios({
              url: "https://wrapapi.com/use/meta-ammo-ca/tenda/tenda/latest",
              method: 'post',
              data: {
                ammotype,
                wrapAPIKey
              }
            }).then(d => { return d.data.data.items; });
            // todo paginate the hoe
          }
          if (type === 'rimfire') {
            prom = Promise.all([
              makeTendaRequest('rimfire-ammo'),
              makeTendaRequest('bulk-ammo'),
            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyRimfire);
          } else if (type === 'centerfire') {
            prom = Promise.all([
              makeTendaRequest('rifle-ammo'),
              makeTendaRequest('handgun-ammo'),
              makeTendaRequest('bulk-ammo'),
            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyCenterfire);
          } else if (type === 'shotgun') {
            prom = Promise.all([
              makeTendaRequest('shotgun-ammo'),
              makeTendaRequest('bulk-ammo'),

            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyShotgun);
          }
        } else if (source === 'canadaammo') {
          function makeCanadaAmmoRequest(ammotype) {
            return axios({
              url: "https://wrapapi.com/use/meta-ammo-ca/canadaammo/canadaammo/latest",
              method: 'post',
              data: {
                ammotype,
                wrapAPIKey
              }
            }).then(d => { return d.data.data ? d.data.data.items : []; }); // dont always have shotgun ammo ...
          }
          if (type === 'rimfire') {
            prom = Promise.resolve([]); // dont have a separate rimfire category
          } else if (type === 'centerfire') {
            prom = Promise.all([
              // these may include rimfire ammo in the future, may need to filter those out
              makeCanadaAmmoRequest('rifle-ammo'),
              makeCanadaAmmoRequest('handgun-ammo'),
            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyCenterfire);
          } else if (type === 'shotgun') {
            prom = Promise.all([
              makeCanadaAmmoRequest('shotgun-ammo'),
            ]).then(results => results.reduce((final, r) => final.concat(r), [])).then(classifyShotgun);
          }
        } else if (source === 'wolverine') {
          switch (type) {
            case 'rimfire':
              prom = makeWolverine('rimfire').then(classifyRimfire);
              break;
            case 'centerfire':
              prom = Promise.all([
                makeWolverine('rifle'),
                makeWolverine('pistol')
              ])
                .then(results => results.reduce((final, r) => final.concat(r), []))
                .then(classifyCenterfire);
              break;
            case 'shotgun':
              prom = makeWolverine('shotgun').then(classifyShotgun);
              break;
            default:
          }
        } else if (source === 'jobrook') {

          function makeJoBrook(ammotype) {
            return axios({
              url: "https://wrapapi.com/use/meta-ammo-ca/jobrook/jobrook/latest",
              method: 'post',
              data: {
                ammotype,
                wrapAPIKey
              }
            }).then(d => { return d.data.data ? d.data.data.items : []; });
          }
          switch (type) {
            case 'rimfire':
              prom = makeJoBrook('rimfire').then(classifyRimfire);
              break;
            case 'centerfire':
              prom = Promise.all([
                makeJoBrook('rifle'),
                makeJoBrook('pistol'),
                makeJoBrook('bulk'),
              ])
                .then(results => results.reduce((final, r) => final.concat(r), []))
                .then(classifyCenterfire);
              break;
            case 'shotgun':
              prom = makeJoBrook('shotgun').then(classifyShotgun);
              break;
            default:
          }
        } else if (source === 'theammosource') {
          prom = theAmmoSource(type);
        } else if (source === 'hirsch') {
          prom = hirsch(type);
        } else if (source === 'wildwest') {
          prom = wildWest(type);
        }

        if (!prom) {
          console.log('unknown type + vendor', source, type);
        }
        prom
          .then(classifyBrand)
          .then(i => proxyImages(i))
          .then(i => addSrcRefToLinks(i))
          .then(getCounts)
          .then(items => {

            console.log(`found  ${items.length} ${type} for ${source}`);
            client.set(key, JSON.stringify(items), (err) => {
              if (err) {
                return reject(err);
              }
              return resolve(items);
            })
          })
          .catch(e => {
            console.error(`failed to load ${type} for ${source}`, e);
            resolve([]);// let other stuff work
          });
      }
    })
  });

}

const SOURCES = [
  'faoc',
  'cabelas',
  'alflahertys',
  'bullseye',
  'sail',
  'canadiantire',
  'reliable',
  'tenda',
  'canadaammo',
  'wolverine',
  'jobrook',
  'theammosource',
  'hirsch',
  'wildwest'
]

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
// TODO: this should break apart by calibare + best deals...
server.route({
  method: 'GET',
  path: '/price-ranges',
  handler: function (request, reply) {
    Promise.all(
      [
        // 'rimfire', 'shotgun', 'centerfire'
      ].map(t =>
        axios(`http://127.0.0.1:8080/${t}`)
          .then(res => ({ type: t, min: res.data[0].price, max: res.data[res.data.length - 1].price }))
        ))
      .then(results => reply(results))
      .catch(e => {
        console.error(`failed to get price ranges`, e)
        reply(boom.badImplementation(`failed to load price summaries`));
      });
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
    const host = targetUrl.hostname.replace('www.', '');
    if ([
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
      'gun-shop.ca'
    ].indexOf(host) === -1) {
      return reply(boom.badRequest('invalid target url'));
    }

    // Track vendor click; todo: use something better than redis

    const key = `TRACK_CLICK_${host}_${moment.utc().format('YYYY-MM-DD')}`;
    client.get(key, (err, res) => {
      if (err) {
        console.error('failed to get ' + key, err);
      }
      const val = res
        ? parseInt(res, 10) + 1
        : 1;

      client.set(key, val, (err1) => {
        if (err1) {
          console.error('failed to set ' + key, err1);
        }
        return reply
          .redirect(request.query.url);
      });
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
          .filter(r => r && (r.price > 0) && r.calibre !== 'UNKNOWN')
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
      .catch(e => { console.error(e); reply(`failed to load ammo lists. ${e}`) })
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
        console.info(`load_${t} has run!`);
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
  console.log(request.info.remoteAddress + ': ' + request.method.toUpperCase() + ' ' + request.url.path + ' --> ' + request.response.statusCode);
});
