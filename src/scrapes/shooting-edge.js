const axios = require('axios');
const cheerio = require('cheerio');
const helpers = require('../helpers');

function fn(section, type, page = 1) {
  return axios.get(`https://theshootingedge.com/collections/ammunition-1?page=${page}`)
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = [];
      $('.product-card').each((index, row) => {
        const result = {};
        const tha = $(row);
        if (tha.find('.product-card__availability').length) {
          return;
        }

        result.link = 'https://theshootingedge.com' + tha.prop('href');
        result.img = 'https:' + tha.find('.product-card__image').prop('src');

        result.name = tha.find('.product-card__name').text();
        result.price = parseFloat(tha.find('.product-card__price').text().replace('$', ''));
        result.vendor = 'The Shooting Edge';
        result.province = 'AB'
        items.push(result);
      })


      if ($('.next').length > 0 && items.length > 0) {
        // load next page
        $ = null; // dont hold onto current page
        console.log('loading theshootingedge page', page + 1)
        return fn(section, type, page + 1)
          .then(ff => ff.concat(items));
      } else {
        return items;
      }
    })

}

function shootingEdge(type) {
  switch (type) {
    case 'rimfire':
    case 'centerfire':
    case 'shotgun':
      return fn(``)
        .then(i => helpers.classifyBullets(i, type));

    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}

module.exports = shootingEdge