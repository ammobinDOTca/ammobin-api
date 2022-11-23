import * as helpers from '../../helpers'
import throat from 'throat'
import { ItemType, IItemListing, Province } from '../../graphql-types'
import { Info, Selectors, scrape } from '../common'

function work(path: String) {
  const info: Info = {
    link: 'bartonsbigcountry.ca',
    name: `Bartons Big Country`,
    provinces: [Province.AB],
  }

  const selectors: Selectors = {
    item: '.product',
    name: '.title',
    img: 'img',
    link: 'a',
    price: '.price',

    // pagination not working as expected...
    // nextPage: '.pages-item-next',
  }
  //https://www.bartonsbigcountry.ca/ammunition/centerfire-rifle/
  const BASE = 'https://' + info.link
  try {
    return scrape((p) => `${BASE}/${path}?limit=100`, info, selectors)
  } catch (e) {
    if (
      e.message.contains('Request failed with status code 403') ||
      e.message.contains('Request failed with status code 404')
    ) {
      return Promise.resolve([] as IItemListing[])
    } else {
      throw e
    }
  }
}

export function barton(type: ItemType): Promise<IItemListing[]|null> {
  const throttle = throat(1)

  switch (type) {
    case ItemType.rimfire:
      return work('ammunition/rimfire')

    case ItemType.centerfire:
      return Promise.all([
        ...[
          '17-hornet',
          // '17-remington-fireball',
          '204-ruger',
          '22-hornet',
          '220-swift',
          '22-250-remington',
          '222-remington',
          '223-remington',
          '556x45mm-nato',
          '223-wssm',
          '224-valkyrie',
          '243-winchester',
          '250-savage',
          '25-06-remington',
          '257-weatherby-mag',
          '26-nosler',
          '260-remington',
          '264-win',
          '270-weatherby-mag',
          '270-win',
          '270-wsm',
          '28-nosler',
          '280-remington',
          '280-ackley-improved',
          '284-win',
          '30-carbine',
          '30-nosler',
          '6mm-remington',
          '6mm-creedmoor',
          '65-creedmoor',
          '65-prc',
          '65x55-swedish',
          '65x300-weatherby-mag',
          '7mm-08-remington',
          '7mm-remington-mag',
          '7mm-rum',
          '7mm-stw',
          '7mm-weatherby-mag',
          '7mm-wsm',
          '762x39mm',
          // '762x54mmr',
          '8mm-remington-mag',
          '30-06-springfield',
          '30-378-weatherby-mag',
          '30-30-winchester',
          '300-aac-blackout',
          '300-rcm',
          '300-wsm',
          '300-weatherby-mag',
          '300-win',
          '300-prc',
          '300-rum',
          '300-norma-mag',
          '303-british',
          '308-marlin-express',
          '308-win',
          '32-winchester-special',
          '325-wsm',
          '338-federal',
          '338-lapua',
          '338-rum',
          '338-winchester-magnum',
          '338-378-weatherby-magnum',
          '35-whelen',
          '375-h-h-magnum',
          '376-steyr',
          '416-rigby',
          '416-ruger',
          '44-mag',
          '44-40-win',
          '45-70-government',
          '450-bushmaster',
          '454-casull',
          '458-winchester-magnum',
          '50-bmg',
        ].map((t) => throttle(() => work('ammunition/centerfire-rifle/' + t))),

        ...[
          '762x25mm-tokarev',
          '9mm',
          '32-auto',
          '38-special',
          '10mm',
          '357-mag',
          '380-auto',
          '40-s-w',
          '41-rem',
          '44-40-win',
          '44-special',
          '44-mag',
          '45-acp',
          '45-colt',
          '454-casull',
          '460-s-w',
          '475-linebaugh',
          '480-ruger',
          '500-s-w',
          '50-ae',
        ].map((t) => throttle(() => work('ammunition/centerfire-pistol/' + t))),
      ]).then(helpers.combineResults)
    case ItemType.shotgun:
      return Promise.all([
        //  '410-bore',
        '28ga',
        '20ga',
        '16ga',
        '10ga',
        '12ga'
      ].map(t => throttle(() => work('ammunition/shotgun/' + t)))).then(helpers.combineResults)

    case ItemType.shot:
      return work('reloading/bullets')
    case ItemType.case:
      return work('reloading/brass')
    case ItemType.powder:
      return work('reloading/powder')
    case ItemType.primer:
      return Promise.resolve(null) // no results as of 20190511
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
