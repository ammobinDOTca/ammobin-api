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

function classifyShotgun(items) {
  return items.map(i => {
    i.calibre = classifier.classifyShotgun(i.calibre || i.name || '').toUpperCase()
    return i;
  });
}

module.exports = function (type) {
  function fn(ammotype) {
    return axios({
      url: "https://wrapapi.com/use/meta-ammo-ca/theammosource/theammosource/latest",
      method: 'post',
      data: {
        ammotype,
        wrapAPIKey
      }
    }).then(d => {
      if (!d.data.data.items) {
        console.warn('no items found for theammosource ' + type);
        return [];
      }

      return d.data.data.items;
    });
  }


  switch (type) {
    case 'rimfire':
      return fn('1_9').then(classifyRimfire);
    case 'shotgun':
      return fn('1_48').then(classifyShotgun);
    case 'centerfire':
      return Promise.all([
        fn('1_33'), // pistol
        fn('1_40') // rifle
      ])
        .then(results => results.reduce((final, r) => final.concat(r), []))
        .then(classifyCenterfire);

    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}
