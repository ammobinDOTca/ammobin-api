
const axios = require('axios');
const cheerio = require('cheerio');
const helpers = require('../helpers');
const throat = require('throat');

function work(type) {
  return axios.get(`http://frontierfirearms.ca/ammunition-reloading/${type}.html`)
    .then(r => {
      const $ = cheerio.load(r.data)
      const items = [];
      $('#frmCompare li').each((index, row) => {
        const result = {};
        const tha = $(row);
        result.link = tha.find('.pname').prop('href');
        result.img = tha.find('img').prop('src');
        result.name = tha.find('.pname').text();
        const priceTxt = tha.find('.p-price .SalePrice').text() || tha.find('.p-price').text()
        result.price = parseFloat(priceTxt.replace('$', ''));
        result.vendor = 'Frontier Firearms';
        result.province = 'SK'

        items.push(result);
      })

      return items;
    })

}

function magdump(type) {
  const throttle = throat(1);

  switch (type) {
    case 'rimfire':
      return work('rimfire-ammunition')
        .then(helpers.classifyRimfire);

    case 'centerfire':

      return Promise.all([
        'surplus-ammunition',
        'hand-gun-ammunition',
        'centerfire-ammunition',
      ].map(t => throttle(() => work(t))))
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire);

    case 'shotgun':
      return Promise.resolve([]); // no items listed aug 29 2017
    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}

module.exports = magdump;