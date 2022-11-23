import * as classifier from 'ammobin-classifier'
import { SQSEvent } from 'aws-lambda'

import { AMMO_TYPES, PROXY_URL } from '../constants'
import { makeSearch } from '../scrapes'
import { classifyBullets, getCountry } from '../helpers'
import { ItemType, IItemListing } from '../graphql-types'
import { logger } from '../logger'
import moment from 'moment'
import * as zlib from 'zlib'
import  {DynamoDBClient} from '@aws-sdk/client-dynamodb'
import  {DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))


function proxyImages(items) {
  return items.map((i) => {
    if (!i.img || i.img === '') {
      return i
    }

    if (i.img.indexOf('//') === 0) {
      i.img = 'http://' + i.img
    }
    // todo: change back to PROXY_URL once ready
    i.img = PROXY_URL + '/x160/' + i.img
    return i
  })
}

function classifyBrand(items) {
  return items.map((i) => {
    i.brand = classifier.classifyBrand(i.brand || i.name || '')
    return i
  })
}

function getCounts(items) {
  return items.map((i) => {
    i.count = isNaN(i.count) ? classifier.getItemCount(i.name) || '' : i.count
    if (i.count > 1) {
      i.unitCost = i.price / i.count
      if (i.unitCost < 0.01) {
        i.unitCost = null // something went wrong with the classifier
      }
    } else {
      i.unitCost = null
    }
    return i
  })
}
// remove empty props (dynamo doesnt want em)
function nukeEmpties(items: IItemListing[]): IItemListing[] {
  return items.map((i) => {
    Object.entries(i).forEach((e) => {
      const key = e[0]
      const value = e[1]
      if (value === null || value === undefined || value === '') {
        delete i[key]
      }
    })
    return i
  })
}

function setItemType(itemType: ItemType) {
  return (items: IItemListing[]) =>
    items.map((i) => {
      i.itemType = itemType
      return i
    })
}

const appendGAParam = (items: IItemListing[]) =>
  items.map((i) => {
    i.link += '?utm_source=ammobin.ca&utm_medium=ammobin.ca'
    return i
  })

const setTTL = (items: IItemListing[]) =>
  items.map((i) => {
    i.ttl = moment().add(7, 'days').utcOffset()
    return i
  })

function removeDuplicates(items: IItemListing[]): IItemListing[] {
  return Object.values(
    items.reduce((map, i) => {
      map[i.link] = i
      return map
    }, {} as { [k: string]: IItemListing })
  )
}

export async function handler(event: SQSEvent) {
  console.log('event', event)
  // want all promises to resolve (failed scrapes should be logged and moved onto the next one)
  await Promise.all(
    event.Records.map(async (r) => {
      const { source, type } = JSON.parse(r.body)

      const searchStart = new Date()
      logger.info({ type: 'started-scrape', source, ItemType: type })
      try {
        const searchRes = await makeSearch(source, type, getCountry())
        if (searchRes === null) {
          // no scrape attempted
          logger.info({ type: 'skipped-scrape', source, ItemType: type })
          return
        }
        return Promise.resolve(searchRes)
          .then((items) => items.filter((i) => i.price && i.link && i.name))
          .then((items) =>
            AMMO_TYPES.includes(type)
              ? classifyBullets(items, type)
              : items.map((i) => {
                  i.subType = type // dont have way to classify subType for reloading items, so just duplicate field
                  return i
                })
          )
          .then(classifyBrand)
          .then(proxyImages)
          .then(getCounts)
          .then(setItemType(type))
          .then(appendGAParam)
          .then(nukeEmpties)
          .then(removeDuplicates)
          .then(setTTL)
          .then((items) => {
            logger.info({
              type: 'finished-scrape',
              source,
              ItemType: type,
              items: items.length,
              duration: new Date().valueOf() - searchStart.valueOf(),
            })
            const ass = items.reduce((map, item) => {
              const id = item.itemType + '_' + item.subType //+ '_' + item.vendor
              if (map[id]) {
                map[id].push(item)
              } else {
                map[id] = [item]
              }
              return map
            }, {} as { [key: string]: IItemListing[] })

            // throattle?
            return Promise.all(
              Object.entries(ass).map((e) => {
                const names = e[1][0].vendor
                const values = zlib.gzipSync(JSON.stringify(e[1])).toString('base64')
                // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Limits.html#limits-expression-parameters
                // size limits The maximum length of all substitution variables in an expression is 2 MB. This is the sum of the lengths of all ExpressionAttributeNames and ExpressionAttributeValues.
                return docClient.send(new UpdateCommand({
                  TableName: 'ammobinItems', // todo: make this env
                  Key: {
                    id: e[0],
                  },
                  UpdateExpression: 'set #vendor = :val',
                  ExpressionAttributeNames: {
                    '#vendor': names,
                  },
                  ExpressionAttributeValues: {
                    ':val': values,
                  },
                }))
          }))
        })
          .catch((e) => {
            logger.info({
              type: 'failed-scrape',
              source,
              ItemType: type,
              msg: e.message,
            })
          })
      } catch (e:any) {
        logger.info({
          type: 'failed-scrape',
          source,
          ItemType: type,
          msg: e.message,
        })
        return
      }
    })
  )
}
