const axios = require('axios');
const cheerio = require('cheerio');
const wrapAPIKey = require('./wrap-api-key');

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
  const titles = d.data.data.titles;
  const myTitles = titles.map(t => {
    const find = columns.find(colNames => colNames.indexOf(t.toLowerCase()) >= 0);
    if (find) {
      return find[0]; // if found a match, return the common property name
    } else {
      return '';
    }
  });

  const items = d.data.data.items;

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
  return axios({
    url: "https://wrapapi.com/use/meta-ammo-ca/cabelas/cabelas/latest",
    method: 'post',
    data: {
      ammoType,
      wrapAPIKey
    }
  }).then(classify);
}

/**
  * makeCabelasCalibre
  * @param {string} ammotype
  *  @param {string} subtype
  * @returns {Promise<{data:{data:{items:string[][],titles:string[]}}}> same format as wrapapi
  */
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
      })

      return { data: { data: { items, titles } } };
    })
    .then(classify);
}

module.exports = { makeCabelasReq, makeCabelasCalibre };
