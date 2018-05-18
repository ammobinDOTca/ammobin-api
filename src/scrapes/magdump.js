
const axios = require('axios');
const cheerio = require('cheerio');
const helpers = require('../helpers');

function work(type) {
  return axios.get(`https://magdump.ca/collections/${type}`)
    .then(r => {
      const $ = cheerio.load(r.data)
      const items = [];
      $('.main-content  .product-card').each((index, row) => {
        const result = {};
        const tha = $(row);
        result.link = 'https://magdump.ca' + tha.prop('href');
        result.img = 'https:' + tha.find('img').prop('src');
        result.name = tha.find('.product-card__name').text();
        const priceTxt = tha.find('.product-card__price').text().split('$');
        result.price = parseFloat(priceTxt.length === 1 ? priceTxt[0] : priceTxt[1]);
        result.vendor = 'Map Dump';
        result.province = 'AB'

        items.push(result);
      })

      return items;
    })

}

// todo: need to pull item counts out from each page
// todo: should pull list calibres... instead of hardcoded list

function magdump(type) {
  switch (type) {
    case 'rimfire':
      return Promise.all([
        'in-stock-22lr',
        // '17-hmr'
      ].map(work))
        .then(helpers.combineResults)
        .then(helpers.classifyRimfire);

    case 'centerfire':
      return Promise.all([
        '7-62x39mm',
        'in-stock-223-rem-5-56-nato',
        '9x19mm-1',
        // '308-winchester',
        // '6-5-creedmoor',
        '9-3x62mm',
        '45-acp'
      ].map(work))
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire);

    case 'shotgun':
      return Promise.resolve(['shotgun'].map(work))
        .then(helpers.combineResults)
        .then(helpers.classifyShotgun);
    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}

module.exports = magdump;