const axios = require('axios');
const cheerio = require('cheerio');
const throat = require('throat');

const helpers = require('../helpers');
const SITE = 'https://vancouvergunstore.ca';
// 0 based list
async function work(type, page = 1) {

  await helpers.delayScrape(SITE)
  console.log(`loading ${type} page ${page} for vancouver gun store`);


  return axios.get(`${SITE}/collections/ammunition/${type}?page=${page}`)
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = [];
      $('.product-index').each((index, row) => {
        const result = {};
        const tha = $(row);


        result.link = SITE + tha.find('.prod-image a').prop('href');
        result.img = 'https:' + tha.find('.prod-image img').prop('src');
        result.name = tha.find('.product-info-inner h3').text();
        const salePrice = tha.find('.price .onsale').text()
        const priceTxt = tha.find('.price .prod-price').text();
        result.price = parseFloat(((salePrice && salePrice.length > 0) ? salePrice : priceTxt).replace('$', ''));

        result.vendor = 'Vancouver Gun Store';
        result.province = 'BC';

        // div always present, empty if actually in stock
        if (tha.find('.product-index-inner .so').length) {
          return;
        }


        items.push(result);
      })

      if ($('.fa-caret-right').length) {
        $ = null; // dont hold onto page
        return work(type, page + 1)
          .then(res => items.concat(res))
      } else {
        return items;
      }
    })
}


function vancouvergunstore(type) {
  const throttle = throat(1);

  switch (type) {

    case 'rimfire':
      return work('Rimfire')
        .then(items => helpers.classifyRimfire(items));

    case 'centerfire':
      return Promise.all([
        'Rifle-Centerfire',
        'Pistol-Centerfire'
      ].map(t => throttle(() => work(t, 1))))
        .then(helpers.combineResults)
        .then(items => helpers.classifyCenterfire(items));

    case 'shotgun':
      return work('Shotshell')
        .then(items => helpers.classifyShotgun(items));

    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}

module.exports = vancouvergunstore;