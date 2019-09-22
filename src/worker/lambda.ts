import * as classifier from 'ammobin-classifier'
import { DynamoDB } from 'aws-sdk'
import { AMMO_TYPES, PROXY_URL } from '../constants'
import { makeSearch } from '../scrapes'
import { classifyBullets } from '../helpers'
import { ItemType, IItemListing } from '../graphql-types'
const docClient = new DynamoDB.DocumentClient()
const logger = {
  info: e => console.log(e),
}

function proxyImages(items) {
  return items.map(i => {
    if (!i.img || i.img === '') {
      return i
    }

    if (i.img.indexOf('//') === 0) {
      i.img = 'http://' + i.img
    }
    i.img = PROXY_URL + '/x160/' + i.img
    return i
  })
}

function classifyBrand(items) {
  return items.map(i => {
    i.brand = classifier.classifyBrand(i.brand || i.name || '')
    return i
  })
}

function getCounts(items) {
  return items.map(i => {
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
  return items.map(i => {
    Object.entries(i).forEach(e => {
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
    items.map(i => {
      i.itemType = itemType
      return i
    })
}

const appendGAParam = (items: IItemListing[]) =>
  items.map(i => {
    i.link += '?utm_source=ammobin.ca&utm_medium=ammobin.ca'
    return i
  })

function removeDuplicates(items: IItemListing[]): IItemListing[] {
  return Object.values(
    items.reduce(
      (map, i) => {
        map[i.link] = i
        return map
      },
      {} as { [k: string]: IItemListing }
    )
  )
}

// https://github.com/alixaxel/chrome-aws-lambda
/**
   * {
  "Records": [
    {
      "messageId": "19dd0b57-b21e-4ac1-bd88-01bbb068cb78",
      "receiptHandle": "MessageReceiptHandle",
      "body": "Hello from SQS!",
      "attributes": {
        "ApproximateReceiveCount": "1",
        "SentTimestamp": "1523232000000",
        "SenderId": "123456789012",
        "ApproximateFirstReceiveTimestamp": "1523232000001"
      },
      "messageAttributes": {},
      "md5OfBody": "7b270e59b47ff90a553787216d55d91d",
      "eventSource": "aws:sqs",
      "eventSourceARN": "arn:aws:sqs:ca-central-1:123456789012:MyQueue",
      "awsRegion": "ca-central-1"
    }
  ]
}
   * @param event
   */
export async function handler(event) {
  // want all promises to resolve (failed scrapes should be logged and moved onto the next one)
  await Promise.all(
    event.Records.map(async r => {
      const { source, type } = JSON.parse(r.body)

      const searchStart = new Date()
      logger.info({ type: 'started-scrape', source, ItemType: type })
      try {
        const searchRes = await makeSearch(source, type)
        if (searchRes === null) {
          // no scrape attempted
          logger.info({ type: 'skipped-scrape', source, ItemType: type })
          return
        }
        return Promise.resolve(searchRes)
          .then(items => items.filter(i => i.price && i.link && i.name))
          .then(items =>
            AMMO_TYPES.includes(type)
              ? classifyBullets(items, type)
              : items.map(i => {
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
          .then(items => {
            logger.info({
              type: 'finished-scrape',
              source,
              ItemType: type,
              items: items.length,
              duration: new Date().valueOf() - searchStart.valueOf(),
            })
            const ass = items.reduce(
              (map, item) => {
                const id = item.itemType + '_' + item.subType //+ '_' + item.vendor
                if (map[id]) {
                  map[id].push(item)
                } else {
                  map[id] = [item]
                }
                return map
              },
              {} as { [key: string]: IItemListing[] }
            )
            Object.entries(ass).forEach(a => console.log(a))
            // throattle?
            return Promise.all(
              Object.entries(ass).map(e => {
                return docClient
                  .update({
                    TableName: 'ammobinItems', // todo: make this env
                    Key: {
                      id: e[0],
                    },
                    UpdateExpression: 'set #vendor = :val',
                    ExpressionAttributeNames: {
                      '#vendor': e[1][0].vendor,
                    },
                    ExpressionAttributeValues: {
                      ':val': e[1],
                    },
                  })
                  .promise()
              })
            )
          })
          .catch(e => {
            logger.info({
              type: 'failed-scrape',
              source,
              ItemType: type,
              msg: e.message,
            })
          })
      } catch (e) {
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
