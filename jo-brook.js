
const helpers = require('./helpers');

function makeJoBrook(ammotype) {
  return helpers.makeWrapApiReq('jobrook', ammotype)
    .then(d => d.items || []);
}

function jobrook(type) {
  switch (type) {
    case 'rimfire':
      return makeJoBrook('rimfire')
        .then(helpers.classifyRimfire);

    case 'centerfire':
      return Promise.all([
        makeJoBrook('rifle'),
        makeJoBrook('pistol'),
        makeJoBrook('bulk'),
      ])
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire);

    case 'shotgun':
      return makeJoBrook('shotgun')
        .then(helpers.classifyShotgun);

    default:
      throw new Error(`unknown type ${type}`);
  }
}

module.exports = jobrook;