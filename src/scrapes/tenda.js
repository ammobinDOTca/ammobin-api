const helpers = require('../helpers');
const throat = require('throat');

function makeTendaRequest(ammotype, page = 1) {
  return helpers.makeWrapApiReq('tenda', ammotype, page)
    .then(d => {
      if (!d.items) {
        return null;
      }
      console.log(`tenda: loaded ${ammotype} page${d.page} of ${d.lastPage}`);
      if (!isNaN(d.lastPage) && d.page < d.lastPage) {
        return new Promise((resolve) => setTimeout(() => resolve(), 1500 + Math.round(100 * Math.random())))
          .then(() => makeTendaRequest(ammotype, page + 1))
          .then(dd => d.items.concat(dd));
      } else {
        return d.items;
      }
    });
}

function tenda(type) {
  const throttle = throat(1);
  switch (type) {
    case 'rimfire':
      return Promise.all([
        'rimfire-ammo',
        'bulk-ammo',
      ].map(t => throttle(() => makeTendaRequest(t))))
        .then(helpers.combineResults)
        .then(helpers.classifyRimfire);

    case 'centerfire':
      return Promise.all([
        'rifle-ammo',
        'handgun-ammo',
        'bulk-ammo',
      ].map(t => throttle(() => makeTendaRequest(t))))
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire);

    case 'shotgun':
      return Promise.all([
        'shotgun-ammo',
        'bulk-ammo',
      ].map(t => throttle(() => makeTendaRequest(t))))
        .then(helpers.combineResults)
        .then(helpers.classifyShotgun);

    default:
      throw new Error(`unknown type: ${type}`);

  }

}

module.exports = tenda;