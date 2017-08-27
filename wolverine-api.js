const axios = require('axios');
const helpers = require('./helpers');

/**
 * makeWolverine api req
 * @param {string} type
 * @return {Promise<{}[]>} asdasd
 */
function makeWolverine(type) {
  let categoryCode = null;
  switch (type) {
    case 'rimfire':
      categoryCode = '300500';
      break;
    case 'rifle':
      categoryCode = '300200';
      break;
    case 'pistol':
      categoryCode = '300400';
      break;
    case 'shotgun':
      categoryCode = '300300';
      break;
    default:
      return Promise.reject(new Error('unexpected ammo type: ' + type));
  }

  const json = {
    "WordList": "",
    "ItemNumber": "",
    "CategoryCode": categoryCode,
    "SearchMethod": "Category",
    "Limit": 0,
    "IsAccpacCategory": true,
    "OnlySearchItemNumbers": false,
    "UsedProductPage": false
  };

  return axios.get('https://www.wolverinesupplies.com/WebServices/ProductSearchService.asmx/GetJSONItems?data=' + encodeURIComponent(JSON.stringify(json)))
    .then(d => {
      const list = d.data;
      return list.slice(1, list.length - 1).map(i => {
        let calibre = null;
        let brand = null;

        i.Attributes.forEach(f => {
          if (f.AttributeName === 'MANUFACTURER') {
            brand = f.AttributeValue;
          } else if (f.AttributeName === 'CALIBER') {
            calibre = f.AttributeValue;
          }
        });
        const rep = new RegExp(/[^a-zA-Z0-9 ]/, 'g')


        return {
          name: i.Title,
          img: i.ImageFile !== 'ImageNotFound'
            ? 'https://www.wolverinesupplies.com/images/items/Thumbnail/' + i.ImageFile + i.ImageExtension
            : null,
          vendor: 'Wolverine',
          province: 'MB',
          price: i.Price,
          calibre,
          brand,
          link: 'https://www.wolverinesupplies.com/ProductDetail/' +
          `${i.ItemNumber}_${i.Title.replace(rep, '-').split(' ').join('-')}`
        }
      });
    })
}

function wolverinesupplies(type) {
  switch (type) {
    case 'rimfire':
      return makeWolverine('rimfire')
        .then(helpers.classifyRimfire);

    case 'centerfire':
      return Promise.all([
        makeWolverine('rifle'),
        makeWolverine('pistol')
      ])
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire);

    case 'shotgun':
      return makeWolverine('shotgun')
        .then(helpers.classifyShotgun);

    default:
      throw new Error(`unknown type: ${type}`);
  }
}

module.exports = wolverinesupplies;