
const axios = require('axios');
const cheerio = require('cheerio');
const helpers = require('../helpers');
const throat = require('throat');

function work(type, page = 1) {
  console.log(`loading lever arms ${type} ${page}`)
  return axios.get(`https://www.leverarms.com/collections/${type}?page=${page}`)
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = [];
      $('.product').each((index, row) => {
        const result = {};
        const tha = $(row);

        if (tha.prop('class').indexOf('outofstock') >= 0) {
          return;
        }

        result.link = 'https://www.leverarms.com' + tha.find('.title a').prop('href');
        result.img = 'https:' + tha.find('img').prop('src');
        result.name = tha.find('.title').text();
        const priceTxt = tha.find('.money').text();
        result.price = parseFloat(priceTxt.replace('$', ''));
        result.vendor = 'Lever Arms';
        result.province = 'BC'

        items.push(result);
      })

      if ($('.next a').length) {
        $ = null; // dont hold onto page for recursion
        return work(type, page + 1)
          .then(results => items.concat(results));
      } else {
        return items;
      }
    })
}
function leverarms(type) {
  const throttle = throat(1);

  switch (type) {
    case 'rimfire':
      return work('rimfire-ammo/Rimfire-Ammo', 1)
        .then(helpers.classifyRimfire);

    case 'centerfire':
      return Promise.all([
        'rifle-ammunition/Rifle-Ammunition',
        'pistol-ammunition/Handgun-Ammo'
      ].map(t => throttle(() => work(t, 1))))
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire);

    case 'shotgun':
      return work('shotgun-shells/Shells', 1)
        .then(helpers.classifyShotgun);
    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}

module.exports = leverarms;
