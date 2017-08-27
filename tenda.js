const helpers = require('./helpers');

function makeTendaRequest(ammotype) {
  return helpers.makeWrapApiReq('tenda', ammotype)
    .then(d => d.items);
  // TODO: paginate the hoe
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