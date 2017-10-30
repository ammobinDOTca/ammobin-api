
const axios = require('axios');
const cheerio = require('cheerio');
const helpers = require('../helpers');

function work(page = 1) {
  console.log(`loading theShootingCenter ${page}`)
  return axios.get(`https://store.theshootingcentre.com/collections/ammo?page=${page}`)
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = [];
      $('.grid-uniform .large--one-quarter.medium--one-third.small--one-half').each((index, row) => {
        const result = {};
        const tha = $(row);
        result.link = 'https://store.theshootingcentre.com' + tha.find('.product-grid-item').prop('href');
        result.img = tha.find('img').prop('src');
        if (result.img && result.img.indexOf('no-image') >= 0) {
          result.img = null;
        }
        result.name = tha.find('p').text();
        const priceTxt = tha.find('.product-item--price').text();
        result.price = parseFloat(priceTxt.replace('$', '')) / 100; // every price is in 2 parts

        result.vendor = 'Calgary Shooting Center';
        result.province = 'AB'

        items.push(result);
      })

      if (items.length === 20) { // just assumes 20 items per page
        $ = null; // dont hold onto page for recursion
        return work(page + 1)
          .then(results => items.concat(results));
      } else {
        return items;
      }
    })
}

function theShootingCenter(type) {
  switch (type) {
    case 'rimfire':
    case 'centerfire':
    case 'shotgun':
      return work()
        .then(items => helpers.classifyBullets(items, type));
    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}

module.exports = theShootingCenter;
