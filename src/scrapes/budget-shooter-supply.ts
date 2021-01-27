import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'
import throat from 'throat'

export function budgetShooterSupply(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    link: 'budgetshootersupply.ca',
    name: `Budget Shooter Supply`,
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.product',
    name: '.product-title',
    img: '.attachment-woocommerce_thumbnail',
    link: 'a',
    price: '.price',

    nextPage: '.next',
  }
  const throttle = throat(1)

  const BASE = `https://www.${info.link}/product-category/categories`
  switch (type) {
    case ItemType.centerfire:
      return Promise.all(
        ['pistol', 'rifle'].map((t) =>
          throttle(() => scrape((p) => `${BASE}/ammunition/centerfire-${t}-ammunition/page/${p}`, info, selectors))
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)
    case ItemType.shotgun:
      return Promise.all(
        ['410-gauge-shotgun', '12-gauge-buckshot'].map((t) =>
          throttle(() => scrape((p) => `${BASE}/ammunition/${t}-ammo/page/${p}`, info, selectors))
        )
      )
        .then(helpers.combineResults)
        .then(helpers.classifyShotgun)
    case ItemType.rimfire:
      return scrape((p) => `${BASE}/ammunition/rimfire-ammunition/page/${p}`, info, selectors).then(
        helpers.classifyRimfire
      )
    case ItemType.case:
      return Promise.all(
        [
          'new-brass-cases/new-pistol-brass-cases',
          'new-brass-cases/new-rifle-brass-cases',
          '1-fired-brass-cases/1-fired-brass-rifle-cases',
          '1-fired-brass-cases/1-fired-brass-pistol-cases',
        ].map((t) =>
          throttle(() => scrape((p) => `${BASE}/rifle-pistol-reloading-components/${t}/page/${p}`, info, selectors))
        )
      ).then(helpers.combineResults)
    case ItemType.powder:
      return Promise.all(
        [
          'accurate-powder',
          'alliant-powder',
          'hodgdon-powder',
          'imr-powder',
          'norma-powder',
          'ramshot-powder',
          'winchester-powder',
        ].map((t) =>
          throttle(() =>
            scrape((p) => `${BASE}/rifle-pistol-reloading-components/smokeless-powder/${t}/page/${p}`, info, selectors)
          )
        )
      ).then(helpers.combineResults)
    case ItemType.primer:
      return Promise.all(
        ['50-bmg', 'large-pistol', 'large-rifle-berdan', 'large-rifle', 'small-pistol', 'small-rifle'].map((t) =>
          throttle(() =>
            scrape((p) => `${BASE}/rifle-pistol-reloading-components/primers/${t}-primers/page/${p}`, info, selectors)
          )
        )
      ).then(helpers.combineResults)
    case ItemType.shot:
      return Promise.all(
        [
          ...[
            '32-caliber-311-32acp',
            '41-caliber-386',
            '30-caliber-308-7-62x25-tokarev',
            '38-caliber-357',
            '40-caliber10mm-400-401',
            '45-caliber-451-452',
            '45-caliber-452-long-colt',
            '50-caliber-500',
            '8mm-320-nambu',
            '8mm-330-lebel',
            '9mm-caliber-355-356',
          ].map((s) => 'pistol-bullets-projectiles/' + s),
          ...[
            '9-3mm-366',
            '22-caliber-222-227',
            '270-caliber-277',
            '30-caliber-308',
            '303-caliber-311-312',
            '338-caliber-338-339',
            '45-caliber-457-459',
            '50-bmg-caliber-510',
            '6-5-caliber-264',
            '6mm-243',
            '7-62x39-310',
            '7mm-284',
          ].map((s) => 'rifle-bullets-projectiles/' + s),
        ].map((t) =>
          throttle(() => scrape((p) => `${BASE}/rifle-pistol-reloading-components/${t}/page/${p}`, info, selectors))
        )
      ).then(helpers.combineResults)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
