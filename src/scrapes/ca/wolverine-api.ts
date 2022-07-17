import axios from 'axios'

import throat from 'throat'
import * as helpers from '../../helpers'
import { ItemType, Province } from '../../graphql-types'

/**
 * makeWolverine api req
 * @param {string} type
 * @return {Promise<{}[]>} asdasd
 */
function makeWolverine(type) {

  return axios
    .get(
      `https://wolverinesupplies.com/shop/${type}?feed=true&ProductInStock=%5BTrue%5D&DoNotShowVariantsAsSingleProducts=True`
    )
    .then((d) => {
      const list = d.data
      return list[0].ProductsContainer.map(i =>
        i.Product[0]
      ).map(i => {

        return {
          name: i.name.trim(),
          vendor: 'Wolverine Supplies',
          province: Province.MB,
          price: i.priceDouble,
          link: 'https://wolverinesupplies.com' + i.link

        }
      })
    })
  //   return list
  //     .slice(1, list.length - 1)
  //     //.filter((i) => i.StockStatus === 'In Stock' && (type !== 'reloading' || isReloadingComponent(i)))
  //     .map((i) => {
  //       let calibre = null
  //       let brand = null

  //       i.Attributes.forEach((f) => {
  //         if (f.AttributeName === 'MANUFACTURER') {
  //           brand = f.AttributeValue
  //         } else if (f.AttributeName === 'CALIBER' && f.AttributeValue !== 'NA') {
  //           calibre = f.AttributeValue
  //         }
  //       })
  //       const rep = new RegExp(/[^a-zA-Z0-9 ]/, 'g')

  //       return {
  //         name: i.Title.trim(),
  //         img:
  //           i.ImageFile && i.ImageFile !== 'ImageNotFound'
  //             ? 'https://www.wolverinesupplies.com/images/items/Thumbnail/' + i.ImageFile + i.ImageExtension
  //             : null,
  //         vendor: 'Wolverine Supplies',
  //         province: Province.MB,
  //         price: i.Price,
  //         calibre,
  //         brand,
  //         link:
  //           'https://www.wolverinesupplies.com/ProductDetail/' +
  //           `${i.ItemNumber}_${i.Title.replace(rep, '-').split(' ').join('-')}`,
  //       }
  //     })
  // })
}

export function wolverinesupplies(type: ItemType) {
  const throttle = throat(1)

  switch (type) {
    case ItemType.rimfire:
      return makeWolverine('rifles/rifle-ammo')

    case ItemType.centerfire:
      return Promise.all(['rifles/rifle-ammo', 'handguns/handgun-ammo'].map((t) => throttle(() => makeWolverine(t)))).then(helpers.combineResults)

    case ItemType.shotgun:
      return makeWolverine('shotguns/shotgun-ammo?')
    case ItemType.case:
    case ItemType.powder:
    case ItemType.primer:
    case ItemType.shot:
      //return makeWolverine('reloading') whatever
      return Promise.resolve(null)

    default:
      throw new Error(`unknown type: ${type}`)
  }
}
