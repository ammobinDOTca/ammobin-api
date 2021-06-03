// https://www.luckyreferrals.com/affiliates/

import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Selectors } from '../common'
import { LUCKY } from '../../vendors-us'

import throat from 'throat'

import { combineResults } from '../../helpers'
const throttle = throat(1)

export function lucky(type: ItemType): Promise<IItemListing[]> {
  const selectors: Selectors = {
    item: '.item',
    name: '.product-name',
    img: 'img',
    link: 'a',
    price: '.regular-price', // they also have a low price
    pricePerRound: '.cprc',
  }

  const work = (t) => scrape((p) => `https://${LUCKY.link}/${t}?viewall=1`, LUCKY, selectors)
  switch (type) {
    case ItemType.rimfire:
      return work('rimfire')
    case ItemType.centerfire:
      return Promise.all(
        [
          'handgun/357-magnum-ammo',
          'handgun/357-sig-ammo',
          'handgun/38-long-colt-ammo',
          'handgun/38-special-ammo',
          'handgun/380-auto-ammo',
          'handgun/40-s-w-ammo',
          'handgun/44-s-w-special-ammo',
          'handgun/45-acp-ammo',
          'handgun/454-casull-ammo',
          'handgun/50-action-express-ammo',
          'handgun/500-sw-magnum-ammo',
          'handgun/9mm-ammo',
          'handgun/9mm-makarov-ammo',
          'handgun/10mm-ammo',
          'handgun/22-tcm-ammo',
          'handgun/25-auto-ammo',
          'handgun/30-luger-ammo',
          'handgun/32-auto-ammo',
          'handgun/32-s-w-ammo',
          'handgun/32-s-w-long-ammo',
          'handgun/32-hr-magnum-ammo',
          'handgun/327-magnum-ammo',
          'handgun/38-s-w-ammo',
          'handgun/41-rem-magnum-ammo',
          'handgun/38-super-ammo',
          'handgun/44-magnum-ammo',
          'handgun/45-gap-ammo',
          'handgun/45-long-colt-ammo',
          'handgun/460-s-w-ammo',
          'handgun/480-ruger-ammo',
          'handgun/7.62x25mm-tokarev-ammo',
          'handgun/762mm-nagant-ammo',
          'handgun/9x18-ultra-ammo',
          'handgun/9x21mm-imi-ammo',
          'handgun/9x23mm-winchester-ammo',
          'rifle/204-ruger-ammo',
          'rifle/22-250-remington-ammo',
          'rifle/222-remington-ammo',
          'rifle/223-remington-ammo',
          'rifle/224-valkyrie-ammo',
          'rifle/25-06-ammo',
          'rifle/270-ammo',
          'rifle/30-carbine-ammo',
          'rifle/30-06-ammo',
          'rifle/30-30-ammo',
          'rifle/300-blackout-ammo',
          'rifle/303-british-ammo',
          'rifle/308-ammo',
          'rifle/450-bushmaster-ammo',
          'rifle/rifle-ammo-450-nitro-express',
          'rifle/45-70-ammo',
          'rifle/50-cal-ammo',
          'rifle/5-45x39mm-ammo',
          'rifle/5.56x45-ammo',
          'rifle/5.6x52mm-rimmed-ammo',
          'rifle/6mm-arc-ammo',
          'rifle/6mm-creedmoor-ammo',
          'rifle/6.5mm-creedmoor-ammo',
          'rifle/6.5mm-japanese-ammo',
          'rifle/6.5-prc-ammo',
          'rifle/6.5x55mm-se-ammo',
          'rifle/6.8-remington-spc-ammo',
          'rifle/7x64mm-brenneke-ammo',
          'rifle/7.62x39mm-ammo',
          'rifle/7.62x54r-ammo',
          'rifle/7mm-winchester-short-magnum-ammo',
          'rifle/17-hornet-ammo',
          'rifle/22-hornet-ammo',
          'rifle/223-wssm-ammo',
          'rifle/243-ammo',
          'rifle/243-wssm-ammo',
          'rifle/25-wssm-ammo',
          'rifle/260-remington-ammo',
          'rifle/270-winchester-short-magnum-ammo',
          'rifle/28-nosler-ammo',
          'rifle/30-40-krag-ammo',
          'rifle/300-hh-magnum-ammo',
          'rifle/300-prc-ammo',
          'rifle/300-winchester-magnum-ammo',
          'rifle/300-winchester-short-magnum-ammo',
          'rifle/32-winchester-special-ammo',
          'rifle/338-lapua-magnum-ammo',
          'rifle/338-winchester-magnum-ammo',
          'rifle/348-winchester-ammo',
          'rifle/35-remington-ammo',
          'rifle/350-legend-ammo',
          'rifle/375-hh-magnum-ammo',
          'rifle/375-winchester-ammo',
          'rifle/38-40-winchester-ammo',
          'rifle/444-marlin-ammo',
          'rifle/44-40-wcf-ammo',
          'rifle/458-lott-ammo',
          'rifle/458-socom-ammo-1',
          'rifle/470-nitro-express-ammo',
          'rifle/50-beowulf-ammo',
          'rifle/500-nitro-express-ammo',
          'rifle/5.7x28mm-ammo',
          'rifle/6mm-remington-ammo',
          'rifle/6.5mm-grendel-ammo',
          'rifle/6-5x52-carcano-ammo',
          'rifle/6.5x57mm-mauser-ammo',
          'rifle/6.5x57mm-rimmed-ammo',
          'rifle/68-western-ammo',
          'rifle/7.5x55mm-swiss-ammo',
          'rifle/7x57mm-mauser-ammo',
          'rifle/7x57mm-rimmmed-ammo',
          'rifle/7.7-japanese-ammo',
          'rifle/7mm-remington-magnum-ammo',
          'rifle/7mm-stw-ammo',
          'rifle/7mm-08-remington-ammo',
          'rifle/8mm-mauser-ammo',
          'rifle/8x57mm-jr-rimmed-mauser-ammo',
          'rifle/8x57mm-jrs-rimmed-mauser-ammo',
          'rifle/9.3x62mm-mauser-ammo',
          'rifle/9.3x72mm-rimmed-ammo',
        ].map((t) => throttle(() => work(t)))
      ).then(combineResults)
    case ItemType.shotgun:
      return Promise.all(
        [
          'shotgun/12-gauge-ammo-shells',
          'shotgun/16-gauge-ammo-shells',
          'shotgun/20-gauge-ammo-shells',
          'shotgun/28-gauge-ammo-shells',
          'shotgun/32-gauge-ammo-shells',
          'shotgun/410-ammo-shells',
        ].map((t) => throttle(() => work(t)))
      ).then(combineResults)

    case ItemType.primer:
    case ItemType.case:
    case ItemType.shot:
    case ItemType.powder:
      return Promise.resolve(null)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
