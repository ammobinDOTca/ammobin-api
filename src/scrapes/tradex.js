
const axios = require('axios');
const cheerio = require('cheerio');
const helpers = require('../helpers');
// 0 based list
function work(page = 0) {
  console.log(`loading page ${page} for tradex`);

  return axios.get(`https://www.tradeexcanada.com/produits/78?page=${page}`)
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = [];
      $('.views-view-grid .col-1, .views-view-grid .col-2, .views-view-grid .col-3, .views-view-grid .col-4').each((index, row) => {
        const result = {};
        const tha = $(row);


        result.link = 'https://www.tradeexcanada.com' + tha.find('.views-field-title a').prop('href');
        result.img = tha.find('img').prop('src');
        result.name = tha.find('.views-field-body').text();
        const priceTxt = tha.find('.uc-price').text();
        result.price = parseFloat(priceTxt.replace('$', ''));
        result.vendor = 'Trade Ex Canada';
        result.province = 'ON';

        // div always present, empty if actually in stock
        if (tha.find('.uc_out_of_stock_html').first().text()) {
          return;
        }


        items.push(result);
      })

      if ($('.pager-last.last').length) {
        $ = null; // dont hold onto page
        return work(page + 1)
          .then(res => items.concat(res))
      } else {
        return items;
      }
    })
}


function tradex(type) {
  switch (type) {
    case 'centerfire':
    case 'shotgun':
    case 'rimfire':
      return work()
        .then(items => helpers.classifyBullets(items, type));
    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}

module.exports = tradex;