
const axios = require('axios');
const cheerio = require('cheerio');
const helpers = require('../helpers');
const throat = require('throat');

function work(type, page = 1) {
  console.log(`loading nasgunsandammo ${type} ${page}`)
  return axios.get(`https://www.nasgunsandammo.com/product-category/ammo/${type}/page/${page}/`)
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = [];
      $('.product').each((index, row) => {
        const result = {};
        const tha = $(row);

        if (tha.prop('class').indexOf('outofstock') >= 0) {
          return;
        }

        result.link = tha.find('.woocommerce-LoopProduct-link').prop('href');
        result.img = tha.find('.kw-prodimage-img').prop('src');
        result.name = tha.find('.kw-details-title').text();
        const priceTxt = tha.find('.price').text();
        result.price = parseFloat(priceTxt.replace('$', ''));
        result.vendor = 'NAS Guns And Ammo';
        result.province = 'ON'

        items.push(result);
      })

      if ($('.pagination-item-next-link').length) {
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
      return work('rimfire', 1)
        .then(helpers.classifyRimfire);

    case 'centerfire':
      return Promise.all([
        'centerfire',
        'surplus-ammo'
      ].map(t => throttle(() => work(t, 1))))
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire);

    case 'shotgun':
      return work('shotgun', 1)
        .then(helpers.classifyShotgun);
    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}

module.exports = magdump;