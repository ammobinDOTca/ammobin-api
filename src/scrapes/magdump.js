const axios = require("axios");
const helpers = require("../helpers");

async function work(type) {
  const r = await axios.get(`https://magdump.ca/${type}`);
  return r.data.products.map(p => {
    return {
      link: p.link,
      img: null,
      name: p.name,
      price: p.price_amount,
      vendor: "Mag Dump",
      province: "AB"
    };
  });
}

// todo: need to pull item counts out from each page
// todo: should pull list calibres... instead of hardcoded list

function magdump(type) {
  switch (type) {
    case "rimfire":
      return Promise.all(
        [
          "13-22-long-rifle"
          // '17-hmr'
        ].map(work)
      )
        .then(helpers.combineResults)
        .then(helpers.classifyRimfire);

    case "centerfire":
      return Promise.all(
        [
          "14-223-rem-556x45mm",
          "15-9mm",
          "16-308-win",
          "21-30-06",
          "22-62x39",
          "52-ammo-by-the-can"
        ].map(work)
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire);

    case "shotgun":
      return Promise.all(["17-12-gauge"].map(work))
        .then(helpers.combineResults)
        .then(helpers.classifyShotgun);
    default:
      return Promise.reject(new Error("unknown type: " + type));
  }
}

module.exports = magdump;
