const axios = require('axios');
const cheerio = require('cheerio');
const ammotype = 'ammotype';
const subtype = 'subtype';

axios.get(`http://www.cabelas.ca/checkproductvariantavailability/${ammotype}?specs=${subtype}`)
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

    return { items, titles };
  })
  .then(r => console.log(r))