

const axios = require('axios');
const cheerio = require('cheerio');
const helpers = require('../helpers');
const throat = require('throat');
const SITE = 'https://www.wanstallsonline.com'
async function getStuff(type, page = 1) {

  await helpers.delayScrape(SITE)

  return axios.get(`${SITE}/adjnav/ajax/category/id/${type}/?order=name&p=${page}&no_cache=true&home=0`)
    .then(r => {
      let $ = cheerio.load(r.data.products)
      const items = [];
      $('.product-box-1').each((index, row) => {
        const result = {};
        const tha = $(row);

        result.link = tha.find('.product-image').prop('href');
        result.img = tha.find('.product-image img').prop('src');

        result.name = tha.find('.product-name').text();


        const salePrice = parseFloat(tha.find('.special-price .price').text().replace('$', ''));
        const regPrice = parseFloat(tha.find('.price-box .price').text().replace('$', ''));
        result.price = isFinite(salePrice) && salePrice > 0 ? salePrice : regPrice;

        result.vendor = 'Wanstalls';
        result.province = 'BC'
        items.push(result);
      });

      const pages = $('.pager .amount').first().text().split(' ').map(i => parseInt(i, 10)).filter(i => isFinite(i))

      if (items.length && pages.length === 2 && pages[0] < pages[1]) {
        $ = null; // dont hold onto page
        console.log(`loading wanstalls page ${page} for type ${type}`)
        return getStuff(type, page + 1)
          .then(res => items.concat(res))
      } else {
        return items;
      }
    });
}

const throttle = throat(1);

function wanstalls(type) {
  switch (type) {
    case 'rimfire':
      return Promise.all([
        104
      ]
        .map(t => throttle(() => getStuff(t, 1)))
      )
        .then(helpers.combineResults)
        .then(helpers.classifyRimfire);

    case 'shotgun':
      return Promise.all([
        105
      ]
        .map(t => throttle(() => getStuff(t, 1)))
      )
        .then(helpers.combineResults)
        .then(helpers.classifyShotgun);

    case 'centerfire':
      return Promise.all([
        102,// pistol
        103,// rifle
        131,// surplus
      ]
        .map(t => throttle(() => getStuff(t, 1)))
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire);
    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}

module.exports = wanstalls
