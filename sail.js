const helpers = require('./helpers');

function makeSailReq(ammotype, page = 1) {
  return helpers.makeWrapApiReq('sail', ammotype, page)
    .then(d => {

      console.log(`sail:  loaded ${ammotype} page${d.page} of ${d.lastPage}`);
      if (!isNaN(d.lastPage) && d.page < d.lastPage) {
        return new Promise((resolve) => setTimeout(() => resolve(), 1500 + Math.round(100 * Math.random())))
          .then(() => makeSailReq(ammotype, page + 1))
          .then(dd => d.items.concat(dd));
      } else {
        return d.items;
      }

    });
}

function sail(type) {
  if (type === 'rimfire') {
    return makeSailReq('rimfire')
      .then(helpers.classifyRimfire);

  } else if (type === 'centerfire') {
    return makeSailReq('centerfire')
      .then(helpers.classifyCenterfire);

  } else if (type === 'shotgun') {
    return Promise.all([
      makeSailReq('shells-steel'),// multi page
      makeSailReq('shells-lead')// multi page
    ])
      .then(helpers.combineResults)
      .then(helpers.classifyShotgun);
  } else {
    throw new Error(`Unknown type: ${type}`);
  }
}

module.exports = sail;