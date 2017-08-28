const classifier = require('ammobin-classifier');
const axios = require('axios');
const wrapAPIKey = require('./wrap-api-key')

module.exports = {
  combineResults: results => results.reduce((final, r) => final.concat(r), []),
  classifyRimfire: (items) => {
    return items.map(i => {
      i.calibre = classifier.classifyRimfire(i.calibre || i.name || '').toUpperCase()
      return i;
    });
  },
  classifyCenterfire: (items) => {
    return items.map(i => {
      i.calibre = classifier.classifyCenterFire(i.calibre || i.name || '').toUpperCase()
      return i;
    });
  },
  classifyShotgun: (items) => {
    return items.map(i => {
      i.calibre = classifier.classifyShotgun(i.calibre || i.name || '').toUpperCase()
      return i;
    });
  },

  classifyBullets: (items, ammo) => {

    /**
     * classify all items of a certain type, then remove all those which where not classified
     */
    return items.map(i => {
      const f = classifier.classifyAmmo(i.name || '');

      if (f.type === ammo) {
        i.calibre = f.calibre.toUpperCase();
      }

      return i;
    })
      .filter(f => f.calibre);
  },
  makeWrapApiReq: (target, ammotype, page = 1) => {
    return axios({
      url: `https://wrapapi.com/use/meta-ammo-ca/${target}/${target}/latest`,
      method: 'post',
      data: {
        ammotype,
        page,
        wrapAPIKey
      }
    })
      .then(d => {
        if (!d.data.data) {
          console.warn(`failed to load list of items for ${target} ${ammotype}`);
          return {};
        }

        return d.data.data;
      });
  }
};