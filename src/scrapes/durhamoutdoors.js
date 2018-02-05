//https://durhamoutdoors.ca/collections/ammo-and-reloading


const axios = require('axios');
const cheerio = require('cheerio');
const helpers = require('../helpers');

function work(page = 1) {
  console.log(`loading durham outdoors ${page}`)
  return axios.get(`https://durhamoutdoors.ca/collections/ammo-and-reloading?page=${page}`)
    .then(r => {
      const $ = cheerio.load(r.data)
      const items = [];
      $('.product').each((index, row) => {
        const result = {};
        const tha = $(row);

        if (tha.find('sale').text().toLowerCase() === 'sold out') {
          return;
        }

        // todo: all of this does not work yet...
        result.link = 'https://durhamoutdoors.ca' + tha.find('a').prop('href');
        result.img = 'https://' + tha.find('a img').prop('src');
        result.name = tha.find('.title').text();
        const priceTxt = tha.find('.price').text();
        result.price = parseFloat(priceTxt.replace('$', ''));
        result.vendor = 'Durham Outdoors';
        result.province = 'ON'

        items.push(result);
      })
      return items;
    })
}

function durhamoutdoors(type) {

  switch (type) {
    case 'rimfire':
    case 'centerfire':
    case 'shotgun':
      return work()
        .then(i => helpers.classifyBullets(i, type));
    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}

module.exports = durhamoutdoors;