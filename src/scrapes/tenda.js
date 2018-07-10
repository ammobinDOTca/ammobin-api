const helpers = require('../helpers');
const throat = require('throat');
const axios = require('axios');
const cheerio = require('cheerio');

async function makeTendaRequest(ammotype, page = 1) {

  await helpers.delayScrape(`https://www.gotenda.com`)
  const f = await axios.get(`http://rendertron:3000/render/https://gotenda.com/product-category/ammunition/${ammotype}/page/${page}/?number=48`)

  let $ = cheerio.load(f.data)
  const items = [];
  $('.product-grid  .item-product').each((index, row) => {
    const result = {};
    const tha = $(row);
    result.link = tha.find('.product-thumb-link').prop('href');
    result.img = tha.find('.product-thum-link img').prop('src');
    result.name = tha.find('.title-product').text().trim();
    const priceTxt = tha.find('.woocommerce-Price-amount').first().text(); // sale price come first...
    result.price = parseFloat(priceTxt.replace('$', ''));
    if (isNaN(result.price)) {
      return; // dont include empty prices
    }
    result.vendor = 'Tenda';
    result.province = 'ON'

    items.push(result);
  })

  if (items.length && $('.product-pagi-nav .next').length > 0) {
    $ = null; // dont hold onto page for recursion
    return makeTendaRequest(ammotype, page + 1)
      .then(results => items.concat(results))
      .catch(e => {
        // sometimes go too far and get 404
        if (e.response && e.response.status === 404) {
          console.warn('went too far with tenda: ' + page)
          return items;
        }
        throw e;
      })
  } else {
    return items;
  }
}

function tenda(type) {
  const throttle = throat(1);
  switch (type) {
    case 'rimfire':
      return Promise.all([
        'rimfire-ammo',
        'bulk-ammo',
      ].map(t => throttle(() => makeTendaRequest(t))))
        .then(helpers.combineResults)
        .then(helpers.classifyRimfire);

    case 'centerfire':
      return Promise.all([
        'rifle-ammo',
        'handgun-ammo',
        'bulk-ammo',
      ].map(t => throttle(() => makeTendaRequest(t))))
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire);

    case 'shotgun':
      return Promise.all([
        'shotgun-ammo',
        'bulk-ammo',
      ].map(t => throttle(() => makeTendaRequest(t))))
        .then(helpers.combineResults)
        .then(helpers.classifyShotgun);

    default:
      throw new Error(`unknown type: ${type}`);

  }

}

module.exports = tenda;
