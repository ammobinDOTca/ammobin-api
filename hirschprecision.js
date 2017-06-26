const axios = require('axios');
const wrapAPIKey = require('./wrap-api-key');
const classifier = require('ammobin-classifier');

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
      return d.data.data.items;
    });
  }


  switch (type) {
    case 'rimfire':
      return fn('98_105').then(classifier.classifyRimfire);
    case 'shotgun':
      return Promise.resolve([]);
    case 'centerfire':
      return fn('98_106').then(classifier.classifyCenterFire);
    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}