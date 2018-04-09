

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


        result.price = tha.find('.price').text().replace('$', '');

        result.vendor = 'Wanstalls';
        result.province = 'BC'
        items.push(result);
      });

      // page size is 12, hope that doesnt line up
      if (items.length === 12) {
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
