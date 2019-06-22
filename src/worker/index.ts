const RSMQWorker = require('rsmq-worker')
import * as classifier from 'ammobin-classifier'
import { AMMO_TYPES, PROXY_URL, QUEUE_NAME } from '../constants'
import { makeSearch } from '../scrapes'
import { getKey, classifyBullets } from '../helpers'
import { ItemType, IItemListing } from '../graphql-types'
const worker = new RSMQWorker(QUEUE_NAME, {
  host: 'redis',
  autostart: true,
  timeout: 180000 /*3 mins*/,
  defaultDelay: 10,
  maxReceiveCount: 1,
})
const logger = require('../logger').workerLogger

const redis = require('redis')
const client = redis.createClient({ host: 'redis' })

function proxyImages(items) {
  return items.map(i => {
    if (!i.img) {
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

worker.on('message', async (msg, next /* , id*/) => {
  const { source, type } = JSON.parse(msg)

  const searchStart = new Date()
  logger.info({ type: 'started-scrape', source, ItemType: type })
  try {
    const searchRes = await makeSearch(source, type)
    if (searchRes === null) {
      // no scrape attempted
      logger.info({ type: 'skipped-scrape', source, ItemType: type })
      return next()
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
      .then(items => {
        logger.info({
          type: 'finished-scrape',
          source,
          ItemType: type,
          items: items.length,
          duration: new Date().valueOf() - searchStart.valueOf(),
        })
        const key = getKey(source, type)

        return new Promise((resolve, reject) =>
          client.set(
            key,
            JSON.stringify(items),
            'EX',
            172800 /*seconds => 48hrs*/,
            err => (err ? reject(err) : resolve(items))
          )
        )
      })
      .then(() => next())
      .catch(e => {
        logger.info({
          type: 'failed-scrape',
          source,
          ItemType: type,
          msg: e.message,
        })
        next(e)
      })
  } catch (e) {
    logger.info({
      type: 'failed-scrape',
      source,
      ItemType: type,
      msg: e.message,
    })
    return next(e)
  }
})

// optional error listeners
worker.on('error', (err, msg) => {
  logger.info({
    type: 'scrape-error',
    message: err && err.message ? err.message : err,
    msg,
  })
})

worker.on('timeout', msg => {
  logger.info({ type: 'TIMEOUT-worker', msg })
})

logger.info({ type: 'started-worker' })
