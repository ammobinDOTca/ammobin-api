
const axios = require('axios');
const cheerio = require('cheerio');

const classifier = require('ammobin-classifier');


function classify(type) {
  return items => items.map(i => {
    const c = classifier.classifyAmmo(i.name || '');
    if (c.type === type) {
      i.calibre = c.calibre.toUpperCase();
    }
    return i;
  });
}

function fn(page) {
  return axios.get(`https://www.rangeviewsports.ca/collections/ammo?page=${page}&sort_by=best-selling`)
    .then(r => {
      const $ = cheerio.load(r.data)
      const items = [];
      $('.grid-uniform .grid-item').each((index, row) => {
        const result = {};
        const tha = $(row);

        result.name = tha.find('p').text();

        const link = tha.find('a').prop('href');
        if (tha.find('.badge--sold-out').length || !link) {
          return;
        }

        result.link = 'https://www.rangeviewsports.ca' + link;
        const src = tha.find('img').prop('src');
        result.img = src ? 'https://www.rangeviewsports.ca' + src : null;


        const priceTxt = tha.find('.product-item--price .h1').text();

        result.price = parseFloat(priceTxt.trim().replace('$', '')) / 100; // account for everything be x.99

        result.vendor = 'Rangeview Sports';
        result.province = 'ON'

        items.push(result);
      })

      return items;
    })

}

const merge = results => results.reduce((final, r) => final.concat(r), []);

module.exports = function (type) {
  switch (type) {
    case 'rimfire':
    case 'centerfire':
    case 'shotgun':
      // TODO: read number of pages to actually get
      return Promise.all([fn(1), fn(2), fn(3)])
        .then(merge)
        .then(classify(type));
    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}