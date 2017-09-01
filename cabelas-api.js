const axios = require('axios');
const cheerio = require('cheerio');
const throat = require('throat');
const helpers = require('./helpers');


const columns =
  [

    [
      'link',
      "Article #"
    ],
    [
      'brand',
      "Brand"
    ],
    [
      'type',
      "Generic Name"
    ],
    [
      'calibre',
      'Gauge',
      'Calibre',
      "Caliber"
    ],
    [
      'velocity',
      "Velocity (FPS)"
    ],
    [
      'bullet',
      "Bullet Type",
      "Type"
    ],
    [
      'weight',
      "Bullet Weight",
      "Shot Size"
    ],
    [
      'count',
      "Rounds per Box"
    ],
    [
      'price',
      "Price"
    ],
    [
      'status',
      "Status",
    ]
  ].map(c => c.map(s => s.toLowerCase()));

function classify(d) {

  if (!d.titles || !d.items) {
    return null;
  }

  const titles = d.titles;
  const myTitles = titles.map(t => {
    const find = columns.find(colNames => colNames.indexOf(t.toLowerCase()) >= 0);
    if (find) {
      return find[0]; // if found a match, return the common property name
    } else {
      return '';
    }
  });

  const items = d.items;

  const result = items.map(i => {
    const item = {
      vendor: 'Cabela\'s',
      province: 'BC,AB,SK,MB,ON,NB,NS'
    };
    for (let index = 0; index < 12; index++) {
      let value = i[index.toString()];
      const prop = myTitles[index];
      if (!prop) {
        continue;
      }

      if (prop === 'link') {
        value = 'http://www.cabelas.ca' + value;
      } else if (prop === 'price') {
        value = parseFloat(value.replace('$', ''), 10);
      } else if (prop === 'count') {
        value = parseInt(value, 10) || value;
      }
      if (value) {
        item[prop] = value;
      }

    }

    item.name = `${item.brand} ${item.type || ''} ${item.calibre},  ${item.weight || ''} ${item.bullet || ''} ${item.velocity || ''}, box of ${item.count}`
    return item;
  })

  return result
    .filter(r => !isNaN(r.price) && r.price > 0);
}

function makeCabelasReq(ammoType) {
  return helpers.makeWrapApiReq('cabelas', ammoType)
    .then(classify);
}

function makeCabelasCalibre(ammotype, subtype) {
  return axios.get(`http://www.cabelas.ca/checkproductvariantavailability/${ammotype}?specs=${subtype}`)
    .then(r => {
      const $ = cheerio.load(r.data)

      const titles = [];
      $('thead').find('th').each((index, row) => titles.push($(row).text()));

      const items = [];
      $('tbody').find('tr').each((index, row) => {
        const result = [];
        result.push($(row).find('a').prop('href'))
        $(row).find('td').each((i, f) => {
          result.push($(f).text().trim());
        });
        items.push(result);
      });
      return { items, titles };
    })
    .then(classify);
}

function cabelas(type) {
  if (type === 'rimfire') {
    return makeCabelasReq("936")

  } else if (type === 'shotgun') {
    return Promise.all([
      makeCabelasReq('928'),
      makeCabelasReq('922'),
      makeCabelasReq('923'),
      makeCabelasReq('924'),
      makeCabelasReq('926'),
    ])
      .then(helpers.combineResults)

  } else if (type === 'centerfire') {
    const throttle = throat(5);

    return Promise.all([
      makeCabelasReq('916'),
      throttle(() => makeCabelasCalibre('933', '19365')),// 204 ruger
      throttle(() => makeCabelasCalibre('933', '20529')),// 22-250 rem
      throttle(() => makeCabelasCalibre('933', '20476')), // 223 rem
      throttle(() => makeCabelasCalibre('933', '20554')),//243 win
      throttle(() => makeCabelasCalibre('933', '20543')), // 270 win
      throttle(() => makeCabelasCalibre('933', '20556')), // 270 wsm
      throttle(() => makeCabelasCalibre('933', '20641')), // 300 rem mag
      throttle(() => makeCabelasCalibre('933', '20547')), // 30 30 win
      throttle(() => makeCabelasCalibre('933', '19413')), // 303 brit
      throttle(() => makeCabelasCalibre('933', '20486')), // 308 wim
      throttle(() => makeCabelasCalibre('933', '20483')), // .30-06 Springfield
      throttle(() => makeCabelasCalibre('933', '20516')), // 338 lapua
      throttle(() => makeCabelasCalibre('933', '20491')), // 40/70
      throttle(() => makeCabelasCalibre('933', '20494')), // 7.62x39
      throttle(() => makeCabelasCalibre('933', '20561')), // 7mm-08
      throttle(() => makeCabelasCalibre('933', '20552')), // 7mm rem mag
      throttle(() => makeCabelasCalibre('933', '20557')), // 7mm wm
    ])
      .then(helpers.combineResults);

  } else {
    throw new Error(`unknown type received: ${type}`);
  }
}

module.exports = cabelas;
