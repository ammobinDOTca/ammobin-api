
const axios = require('axios');
const cheerio = require('cheerio');
const helpers = require('../helpers');
const throat = require('throat');

function work(page = 1) {
  console.log(`loading bvoutdoors ${type} ${page}`)
  return axios.get(`https://store.theshootingcentre.com/collections/ammo?page=${page}`)
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = [];
      $('.grid-uniform .grid-item').each((index, row) => {
        const result = {};
        const tha = $(row);
        result.link = tha.find('.product-grid-item').prop('href');
        //https://cdn.shopify.com/s/assets/no-image-2048-5e88c1b20e087fb7bbe9a3771824e743c244f437e4f8ba93bbf7b11b53f7824c_large.gif
        https://cdn.shopify.com/s/assets/no-image-2048-5e88c1b20e087fb7bbe9a3771824e743c244f437e4f8ba93bbf7b11b53f7824c_large.gif
        result.img = tha.find('img').prop('src');
        if(result.img && result.img.indexOf('no-image') > =0 ) {
          result.img = null;
        }
        result.name = tha.find('p').text();
        const priceTxt = tha.find('.product-item--price').text();
        result.price = parseFloat(priceTxt.replace('$', ''));
        
        result.vendor = 'The Shooting Center';
        result.province = 'AB'

        items.push(result);
      })

      if ($('.pagination-custom .disabled').length === 0 && items.length) {
        $ = null; // dont hold onto page for recursion
        return work(type, page + 1)
          .then(results => items.concat(results));
      } else {
        return items;
      }
    })
}
