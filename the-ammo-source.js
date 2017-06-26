const axios = require('axios');
const wrapAPIKey = require('./wrap-api-key');
const classifier = require('ammobin-classifier');

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
      return d.data.data.items;
    });
  }


  switch (type) {
    case 'rimfire':
      return fn('1_9').then(classifier.classifyRimfire);
    case 'shotgun':
      return fn('1_48').then(classifier.classifyShotgun);
    case 'centerfire':
      return Promise.all([
        fn('1_33'), // pistol
        fn('1_40') // rifle
      ])
        .then(results => results.reduce((final, r) => final.concat(r), []))
        .then(classifier.classifyCenterFire);

    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}