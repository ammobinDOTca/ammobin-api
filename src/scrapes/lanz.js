
const axios = require('axios');
const cheerio = require('cheerio');
const helpers = require('../helpers');
const throat = require('throat');

async function work(type, page = 1) {
  await helpers.delayScrape('http://www.lanzshootingsupplies.com')
  console.log(`loading  lanz ${type} ${page}`)

  return axios.get(`http://www.lanzshootingsupplies.com/shop/ammunition/${type}/page${page}.html?limit=50`)
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = [];
      $('.product-block-inner').each((index, row) => {
        const result = {};
        const tha = $(row);

        result.link = tha.find('a').prop('href');
        result.img = tha.find('img').prop('src');
        result.name = tha.find('h3 a').prop('title');
        const priceTxt = tha.find('.price').text();
        result.price = parseFloat(priceTxt.replace('C$', ''));
        result.vendor = 'Lanz Shooting Supplies';
        result.province = 'ON'

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

function lanz(type) {
  const throttle = throat(1);

  switch (type) {
    case 'rimfire':
      return work('rimfire-ammunition', 1)
        .then(helpers.classifyRimfire);

    case 'centerfire':
      return Promise.all([
        'handgun-ammunition',
        'rifle-ammunition',
        'bulk-ammunition'
      ].map(t => throttle(() => work(t, 1))))
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire);

    case 'shotgun':
      return work('shotgun-ammunition', 1)
        .then(helpers.classifyShotgun);
    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}

module.exports = lanz;
