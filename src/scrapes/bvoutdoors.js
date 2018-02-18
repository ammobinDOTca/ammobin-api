
const axios = require('axios');
const cheerio = require('cheerio');
const helpers = require('../helpers');
const throat = require('throat');

async function work(type, page = 1) {
  await helpers.delayScrape('https://www.bvoutdoors.com')

  console.log(`loading bvoutdoors ${type} ${page}`)
  return axios.get(`https://www.bvoutdoors.com/${type}/?page=${page}&matchesperpage=80`)
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = [];
      $('.product-list-item').each((index, row) => {
        const result = {};
        const tha = $(row);
        result.link = tha.find('.product-link').prop('href');
        result.img = tha.find('.image-thumb').prop('src');
        result.name = tha.find('.productnameTitle').text();
        const priceTxt = tha.find('.text-price').text();
        result.price = parseFloat(priceTxt.replace('$', ''));
        result.brand = tha.find('.caption h6').text();
        result.vendor = 'Outdoor Essentials';
        result.province = 'BC'

        items.push(result);
      })

      if ($('.button-small.next').length) {
        $ = null; // dont hold onto page for recursion
        return work(type, page + 1)
          .then(results => items.concat(results));
      } else {
        return items;
      }
    })
}
function magdump(type) {
  const throttle = throat(1);

  switch (type) {
    case 'rimfire':
      return work('Ammunition-Rimfire-2')
        .then(helpers.classifyRimfire);

    case 'centerfire':
      return Promise.all([
        'Ammunition-Military-Surplus-318',
        'Ammunition-Rifle-1',
        'Ammunition-Handgun-108'
      ].map(t => throttle(() => work(t, 1))))
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire);

    case 'shotgun':
      return Promise.all([
        'Ammunition-Shotshells-3',
        'Ammunition-Slugs-258',
        'Ammunition-Buckshot-257'
      ].map(t => throttle(() => work(t, 1))))
        .then(helpers.combineResults)
        .then(helpers.classifyShotgun);
    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}

module.exports = magdump;