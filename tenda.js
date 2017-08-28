const helpers = require('./helpers');

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
  if (type === 'rimfire') {
    return Promise.all([
      makeTendaRequest('rimfire-ammo'),
      makeTendaRequest('bulk-ammo'),
    ])
      .then(helpers.combineResults)
      .then(helpers.classifyRimfire);

  } else if (type === 'centerfire') {
    return Promise.all([
      makeTendaRequest('rifle-ammo'),
      makeTendaRequest('handgun-ammo'),
      makeTendaRequest('bulk-ammo'),
    ])
      .then(helpers.combineResults)
      .then(helpers.classifyCenterfire);

  } else if (type === 'shotgun') {
    return Promise.all([
      makeTendaRequest('shotgun-ammo'),
      makeTendaRequest('bulk-ammo'),

    ])
      .then(helpers.combineResults)
      .then(helpers.classifyShotgun);
  } else {
    throw new Error(`unknown type: ${type}`);
  }
}

module.exports = tenda;