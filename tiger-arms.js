// https://gun-shop.ca/product-category/ammunition/bulk-ammo/?orderby=price&count=100

const axios = require('axios');
const cheerio = require('cheerio');

const classifier = require('ammobin-classifier');


function classifyBullets(items, ammo) {
  return items.map(i => {
    const f = classifier.classifyAmmo(i.name || '');

    if (f.type === ammo) {
      i.calibre = f.calibre.toUpperCase();
    }

    return i;
  })
    .filter(f => f.calibre);
}

function classifyShotgun(items) {
  return items.map(i => {
    i.calibre = classifier.classifyShotgun(i.name || '').toUpperCase();
    return i;
  });
}

function fn(type, page = 1) {
  return axios.get(`http://www.tigerarms.ca/product-category/ammunition/${type}/page/${page}/`)
    .then(r => {
      const $ = cheerio.load(r.data)
      const items = [];
      $('.product-inner').each((index, row) => {
        const result = {};
        const tha = $(row);
        if (tha.find('.gema75_soldout_badge_new_2327').length) {
          return;
        }

        result.link = tha.find('.woocommerce-LoopProduct-link').prop('href');
        result.img = tha.find('.attachment-shop_catalog').prop('src');
        result.name = tha.find('.product-info h3').text();
        result.price = parseFloat(tha.find('.amount').text().replace('$', ''));
        result.vendor = 'Tiger Arms';
        result.province = 'BC'
        items.push(result);
      })

      if ($('.fa-angle-right').length) {
        // load next page
        console.log('loading tiger arms page', page + 1)
        return fn(type, page + 1)
          .then(ff => ff.concat(items));
      } else {
        return items;
      }
    })

}

module.exports = function (type) {
  switch (type) {
    case 'rimfire':
      return fn('rifle-ammo')
        .then(i => classifyBullets(i, type));
    case 'centerfire':
      return Promise.all([fn('handgun-ammo'), fn('rifle-ammo')])
        .then(results => results.reduce((final, r) => final.concat(r), []))
        .then(i => classifyBullets(i, type));
    case 'shotgun':
      return fn('shotgun-ammo').then(classifyShotgun);
    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}