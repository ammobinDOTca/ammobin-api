import * as helpers from '../helpers'

async function makeSailReq(ammotype, page = 1) {
  await helpers.delayScrape('https://www.sail.ca')

  return helpers.makeWrapApiReq('sail', ammotype, page).then(d => {
    console.log(`sail:  loaded ${ammotype} page${d.page} of ${d.lastPage}`)
    if (
      !isNaN(d.lastPage) &&
      d.page < d.lastPage &&
      d.items &&
      d.items.length > 0 &&
      false // todo: FIX this
    ) {
      return makeSailReq(ammotype, page + 1).then(dd => d.items.concat(dd))
    } else {
      return d.items
    }
  })
}

export function sail(type) {
  if (type === 'rimfire') {
    return makeSailReq('rimfire').then(helpers.classifyRimfire)
  } else if (type === 'centerfire') {
    return makeSailReq('centerfire').then(helpers.classifyCenterfire)
  } else if (type === 'shotgun') {
    return makeSailReq('shotguns').then(helpers.classifyShotgun)
  } else {
    throw new Error(`Unknown type: ${type}`)
  }
}
