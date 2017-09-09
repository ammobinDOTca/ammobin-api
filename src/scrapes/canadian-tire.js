const axios = require('axios');
const helpers = require('../helpers');

function work(page) {

  // TODO: need to get all result pages  ("pagination": {"total": 6, )

  return axios.get(`http://api.canadiantire.ca/search/api/v0/product/en/?site=ct;store=0600;x1=c.cat-level-1;q1=Playing;x2=c.cat-level-2;q2=Hunting;x3=c.cat-level-3;q3=Ammunition;x4=c.cat-level-4;q4=${encodeURIComponent(page)};format=json;count=36;q=*;callback=callback`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
      'Refer': 'http://www.canadiantire.ca/en/sports-rec/hunting/ammunition.html'
    }
  }).then(res => {
    const t = res.data.replace('callback(', '');

    const f = t.slice(0, t.length - 2)
    const items = JSON.parse(f).results.map(f => {
      const item = f.field;
      return {
        name: item['prod-name'],
        link: 'http://www.canadiantire.ca' + item['pdp-url'],
        img: item['thumb-img-url'],
        vendor: 'Canadian Tire',
        _id: item['prod-id']
      }
    })

    return axios.get('http://www.canadiantire.ca/ESB/PriceAvailability', {
      params: {
        _: new Date().getTime(),
        Product: items.map(f => f[`_id`]).join(','),
        Store: '0600',
        Banner: 'CTR',
        isKiosk: 'FALSE',
        Language: 'E'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
        'Host': 'www.canadiantire.ca',
        'Refer': 'http://www.canadiantire.ca/en/sports-rec/hunting/ammunition.html'
      }
    })
      .then(r => {
        const list = Object.keys(r.data).map(k => r.data[k]);

        return items.map(i => {
          i.price = (list.find(r => r.Product === i[`_id`]) || {}).Price;
          return i
        })
      })
  });
}

function canadiantire(type) {
  if (type === 'rimfire') {
    return work('Rimfire Ammunition')
      .then(helpers.classifyRimfire);

  } else if (type === 'centerfire') {
    return work('Centerfire Ammunition')
      .then(helpers.classifyCenterfire);

  } else if (type === 'shotgun') {
    return Promise.all([
      work('Lead Shotgun Shells'),
      work('Steel Shotgun Shells'),
      work('Slugs & Buckshots'),
    ])
      .then(helpers.combineResults)
      .then(helpers.classifyShotgun);
  } else {
    throw new Error(`unknown type: ${type}`)
  }
}

module.exports = canadiantire;
