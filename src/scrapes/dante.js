
const axios = require('axios');
const cheerio = require('cheerio');
const helpers = require('../helpers');

function work(type) {
  console.log(`loading dante ${type}`)
  return axios.get(`https://www.dantesports.com/en/product-category/shop/ammunition/${type}/?product_count=100`)
    .then(r => {
      const $ = cheerio.load(r.data)
      const items = [];
      $('.product').each((index, row) => {
        const result = {};
        const tha = $(row);

        if (tha.prop('class').indexOf('outofstock') >= 0) {
          return;
        }

        result.link = tha.find('.woocommerce-LoopProduct-link').prop('href');
        result.img = tha.find('.wp-post-image').prop('src');
        result.name = tha.find('.woocommerce-loop-product__title').text();
        const priceTxt = tha.find('.woocommerce-Price-amount').text();
        result.price = parseFloat(priceTxt.replace('$', ''));
        result.vendor = 'Dante';
        result.province = 'QC'

        items.push(result);
      })
      return items;
    })
}
function magdump(type) {

  switch (type) {
    case 'rimfire':
      return work('rimfire')
        .then(helpers.classifyRimfire);

    case 'centerfire':
      return work('centerfire')
        .then(helpers.classifyCenterfire);

    case 'shotgun':
      return work('shotshells')
        .then(helpers.classifyShotgun);
    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}

module.exports = magdump;