const helpers = require('../helpers');

async function makeReliableRequest(ammotype, page = 1) {
  await helpers.delayScrape('https://www.reliablegun.com')

  return helpers.makeWrapApiReq('reliablegun', ammotype, page)
    .then(d => {
      console.log(`reliablegun:  loaded ${ammotype} page${d.page} of ${d.lastPage}`);
      if (!isNaN(d.lastPage) && d.page < d.lastPage) {
        return makeReliableRequest(ammotype, page + 1)
          .then(dd => d.items.concat(dd));
      } else {
        return d.items;
      }
    });
}

function reliablegun(type) {
  if (type === 'rimfire') {
    return makeReliableRequest('rimfire-ammunition')
      .then(helpers.classifyRimfire);

  } else if (type === 'centerfire') {
    return Promise.all([
      makeReliableRequest('rifle-ammunition'), // multi page
      makeReliableRequest('hand-gun-ammunition'), // multi page
    ])
      .then(helpers.combineResults)
      .then(helpers.classifyCenterfire);

  } else if (type === 'shotgun') {
    return makeReliableRequest('shotgun-ammunition')
      .then(helpers.classifyShotgun);

  } else {
    throw new Error(`unknown type: ${type}`);
  }
}

module.exports = reliablegun