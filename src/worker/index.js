
const RSMQWorker = require("rsmq-worker");
const classifier = require('ammobin-classifier');
const CONSTANTS = require('../constants');
const makeSearch = require('../scrapes');

const getKey = require('../helpers').getKey;
const worker = new RSMQWorker(CONSTANTS.QUEUE_NAME,
  {
    host: 'redis',
    autostart: true,
    timeout: 120000, /*2 mins*/
    defaultDelay: 10,
    maxReceiveCount: 1
  });


const redis = require('redis');
const client = redis.createClient({ host: 'redis' });

function proxyImages(items) {
  return items.map(i => {
    if (!i.img) {
      return i;
    }

    if (i.img.indexOf('//') === 0) {
      i.img = 'http://' + i.img;
    }
    i.img = CONSTANTS.PROXY_URL + '/x160/' + i.img;
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


worker.on("message", function (msg, next, id) {
  // process your message
  console.log("Message id : " + id);
  const { source, type } = JSON.parse(msg);
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
      return new Promise((resolve, reject) => client.set(key, JSON.stringify(items), 'EX', 172800 /*seconds => 48hrs*/, (err) => err ? reject(err) : resolve(items)));
    })
    .then(() => next())
    .catch(e => {
      console.error(`ERROR: failed to load ${source} ${type} => ${e && e.message ? e.message : e}`);
      next(e);
    });
});

// optional error listeners
worker.on('error', function (err, msg) {
  console.error("ERROR", err && err.message ? err.message : err, msg.id);
});

worker.on('timeout', function (msg) {
  console.log("TIMEOUT", msg.id, msg.rc);
});

console.log('started')