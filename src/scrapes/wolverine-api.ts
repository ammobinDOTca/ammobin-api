import axios from 'axios'

import throat from 'throat'
import * as helpers from '../helpers'
import { ItemType, Province } from '../graphql-types'

/**
 * makeWolverine api req
 * @param {string} type
 * @return {Promise<{}[]>} asdasd
 */
function makeWolverine(type) {
  let categoryCode = null
  switch (type) {
    case 'rimfire':
      categoryCode = '300500'
      break
    case 'rifle':
      categoryCode = '300200'
      break
    case 'pistol':
      categoryCode = '300400'
      break
    case 'shotgun':
      categoryCode = '300300'
      break
    case 'reloading':
      categoryCode = '300100'
      break
    default:
      return Promise.reject(new Error('unexpected ammo type: ' + type))
  }

  const json = {
    WordList: '',
    ItemNumber: '',
    CategoryCode: categoryCode,
    SearchMethod: 'Category',
    Limit: 0,
    IsAccpacCategory: true,
    OnlySearchItemNumbers: false,
    UsedProductPage: false,
  }

  function isReloadingComponent(item): boolean {
    return (
      item.Attributes.filter(
        a =>
          a.AttributeName === 'SUBCATEGORY' &&
          a.AttributeValue === 'RELOADING COMPONENTS'
      ).length > 0
    )
  }

  return axios
    .get(
      'https://www.wolverinesupplies.com/WebServices/ProductSearchService.asmx/GetJSONItems?data=' +
        encodeURIComponent(JSON.stringify(json))
    )
    .then(d => {
      const list = d.data
      return list
        .slice(1, list.length - 1)
        .filter(
          i =>
            i.StockStatus === 'In Stock' &&
            (type !== 'reloading' || isReloadingComponent(i))
        )
        .map(i => {
          let calibre = null
          let brand = null

          i.Attributes.forEach(f => {
            if (f.AttributeName === 'MANUFACTURER') {
              brand = f.AttributeValue
            } else if (
              f.AttributeName === 'CALIBER' &&
              f.AttributeValue !== 'NA'
            ) {
              calibre = f.AttributeValue
            }
          })
          const rep = new RegExp(/[^a-zA-Z0-9 ]/, 'g')

          return {
            name: i.Title.trim(),
            img:
              i.ImageFile && i.ImageFile !== 'ImageNotFound'
                ? 'https://www.wolverinesupplies.com/images/items/Thumbnail/' +
                  i.ImageFile +
                  i.ImageExtension
                : null,
            vendor: 'Wolverine Supplies',
            province: Province.MB,
            price: i.Price,
            calibre,
            brand,
            link:
              'https://www.wolverinesupplies.com/ProductDetail/' +
              `${i.ItemNumber}_${i.Title.replace(rep, '-')
                .split(' ')
                .join('-')}`,
          }
        })
    })
}

export function wolverinesupplies(type: ItemType) {
  const throttle = throat(1)

  switch (type) {
    case ItemType.rimfire:
      return makeWolverine('rimfire')

    case ItemType.centerfire:
      return Promise.all(
        ['rifle', 'pistol'].map(t => throttle(() => makeWolverine(t)))
      ).then(helpers.combineResults)

    case ItemType.shotgun:
      return makeWolverine('shotgun')
    case ItemType.case:
    case ItemType.powder:
    case ItemType.primer:
    case ItemType.shot:
      return makeWolverine('reloading')
    default:
      throw new Error(`unknown type: ${type}`)
  }
}
