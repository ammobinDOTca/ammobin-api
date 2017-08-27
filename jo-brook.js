const axios = require('axios');
const wrapAPIKey = require('./wrap-api-key');

function makeJoBrook(ammotype) {
  return axios({
    url: "https://wrapapi.com/use/meta-ammo-ca/jobrook/jobrook/latest",
    method: 'post',
    data: {
      ammotype,
      wrapAPIKey
    }
  })
    .then(d => { return d.data.data ? d.data.data.items : []; });
}

module.exports = makeJoBrook;