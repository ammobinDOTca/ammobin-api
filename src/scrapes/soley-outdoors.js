const axios = require('axios');
const cheerio = require('cheerio');
const throat = require('throat');
const helpers = require('../helpers');

async function work(type, page = 1) {

  await helpers.delayScrape('https://www.solelyoutdoors.com')
  console.log(`loading solely outdoors ${page}`)

  return axios.get(`https://www.solelyoutdoors.com/ammunition/${type}/page${page}.html`)
    .then(r => {
      let $ = cheerio.load(r.data)
      const items = [];
      $('.product').each((index, row) => {
        const result = {};
        const tha = $(row);


        result.link = tha.find('.image-wrap a').prop('href');
        result.img = tha.find('.image-wrap img').prop('src');
        result.name = tha.find('.image-wrap a').prop('title').trim();
        const priceTxt = tha.find('.info .left').text();
        result.price = parseFloat(priceTxt.replace('C$', ''));
        result.vendor = 'Soley Outdoors';
        result.province = 'ON'

        items.push(result);
      })

      // having redirect problem, disabled pulling other pages for now
      if (1 > 2 && $('.next.enabled').length) {
        $ = null; // dont hold onto page for recursion
        return work(type, page + 1)
          .then(results => items.concat(results));
      } else {
        return items;
      }

    })
}

function solelyoutdoors(type) {
  const throttle = throat(1);

  switch (type) {
    case 'rimfire':
      return work('rimfire-ammo', 1)
        .then(helpers.classifyRimfire);

    case 'centerfire':
      return Promise.all([
        'centerfire-ammo',
        'handgun-ammo',
        'rifle-ammo'
      ]
        .map(t => throttle(() => work(t))))
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire);

    case 'shotgun':
      return work('shotgun-ammo', 1).then(helpers.classifyShotgun);

    default:
      return Promise.reject(new Error('unknown type: ' + type));
  }
}

module.exports = solelyoutdoors;