const helpers = require('./helpers');

function makeBullsReq(ammotype) {
  return helpers.makeWrapApiReq('bullseye', ammotype)
    .then(d => d.items);
}

function bullseyelondon(type) {
  if (type === 'rimfire') {
    return makeBullsReq('rimfire-ammunition')
      .then(helpers.classifyRimfire);

  } else if (type === 'centerfire') {
    return Promise.all([
      makeBullsReq('pistol-ammunition'),
      makeBullsReq('rifle-ammunition'),
    ])
      .then(helpers.combineResults)
      .then(helpers.classifyCenterfire);

  } else if (type === 'shotgun') {
    return makeBullsReq('shotgun')
      .then(helpers.classifyShotgun);

  } else {
    throw new Error(`unknown type: ${type}`);
  }
}

module.exports = bullseyelondon;