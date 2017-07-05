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
  });
}

function classifyShotgun(items) {
  return items.map(i => {
    i.calibre = classifier.classifyShotgun(i.name || '').toUpperCase();
    return i;
  });
}

function fn(type) {
  return axios.get(`https://gun-shop.ca/product-category/ammunition/${type}/?orderby=price-desc`)
    .then(r => {
      const $ = cheerio.load(r.data)
      const items = [];
      $('.product').each((index, row) => {
        const result = {};
        const tha = $(row);
        result.link = tha.find('a').prop('href');
        result.img = tha.find('img').prop('data-src');
        result.name = tha.find('.entry-title').text();
        result.price = parseFloat(tha.find('.amount').text().replace('$', ''));
        //console.log((tha.find('.amount').text()))
        result.vendor = 'Wild West';
        result.province = 'AB'
        items.push(result);
      })

      return items;
    })

}

module.exports = function (type) {
  switch (type) {
    case 'rimfire':
    case 'centerfire':
      return Promise.all([fn('bulk-ammo'), fn('box-ammo')])
        .then(results => results.reduce((final, r) => final.concat(r), []))
        .then(i => classifyBullets(i, type));
    case 'shotgun':
      return fn('shotgun-ammo').then(classifyShotgun);
    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}