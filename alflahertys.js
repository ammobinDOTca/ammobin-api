const helpers = require('./helpers');

function makeAlReq(ammotype, page = 1) {
  return helpers.makeWrapApiReq('alflahertys', ammotype, page)
    .then(d => {
      if (!d.items) {
        return [];
      }
      console.log(`alflahertys: loaded ${ammotype} page${d.page} of ${d.lastPage}`);
      if (!isNaN(d.lastPage) && d.page < d.lastPage) {
        return new Promise((resolve) => setTimeout(() => resolve(), 1500 + Math.round(100 * Math.random())))
          .then(() => makeAlReq(ammotype, page + 1))
          .then(dd => d.items.concat(dd));
      } else {
        return d.items;
      }
    });
}

/**
 * make call to alflahertys
 * @param {'rimfire'|'centerfire'|'shotgun'} type
 * @returns Promise<any[]>
 */
function alflahertys(type) {

  if (type === 'rimfire') {
    return makeAlReq('Rimfire-Ammo')
      .then(helpers.classifyRimfire);

  } else if (type === 'centerfire') {
    return Promise.all([
      makeAlReq('Rifle-Ammunition'), // multi page
      makeAlReq('Bulk-Rifle'),
      makeAlReq('Pistol-Ammo'),// multi page
    ])
      .then(helpers.combineResults)
      .then(helpers.classifyCenterfire);

  } else if (type === 'shotgun') {
    return makeAlReq('Shotgun-Ammo')// multi page
      .then(helpers.classifyShotgun);
  } else {
    throw new Error(`unknown type ${type}`);
  }
}

module.exports = alflahertys;