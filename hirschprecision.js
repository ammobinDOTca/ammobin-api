const axios = require('axios');
const wrapAPIKey = require('./wrap-api-key');
const classifier = require('ammobin-classifier');

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

module.exports = function (type) {
  function fn(ammotype) {
    return axios({
      url: "https://wrapapi.com/use/meta-ammo-ca/hirschprecision/hirschprecision/latest",
      method: 'post',
      data: {
        ammotype,
        wrapAPIKey
      }
    }).then(d => {
      if (!d.data.data.items) {
        console.warn('no items found for hirsch ' + type);
        return [];
      }

      return d.data.data.items;
    });
  }


  switch (type) {
    case 'rimfire':
      return fn('98_105').then(classifyRimfire);
    case 'shotgun':
      return Promise.resolve([]);
    case 'centerfire':
      return fn('98_106').then(classifyCenterfire);
    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}
