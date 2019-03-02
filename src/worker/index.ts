const RSMQWorker = require('rsmq-worker')
import * as classifier from 'ammobin-classifier'
import * as CONSTANTS from '../constants'
import { makeSearch } from '../scrapes'
import { getKey } from '../helpers'
import { AmmoType, IAmmoListing } from '../graphql-types'
const worker = new RSMQWorker(CONSTANTS.QUEUE_NAME, {
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
    i.img = CONSTANTS.PROXY_URL + '/x160/' + i.img
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

function setAmmoType(ammoType: AmmoType) {
  return (items: IAmmoListing[]) =>
    items.map(i => {
      i.ammoType = ammoType
      return i
    })
}

const appendGAParam = (items: IAmmoListing[]) =>
  items.map(i => {
    i.link += '?utm_source=ammobin.ca&utm_medium=ammobin.ca'
    return i
  })

worker.on('message', function(msg, next /* , id*/) {
  const { source, type } = JSON.parse(msg)

  const searchStart = new Date()
  logger.info({ type: 'started-scrape', source, ammoType: type })
  try {
    return makeSearch(source, type)
      .then(items => items.filter(i => i.price && i.link && i.name))
      .then(classifyBrand)
      .then(proxyImages)
      .then(getCounts)
      .then(setAmmoType(type))
      .then(appendGAParam)
      .then(items => {
        logger.info({
          type: 'finished-scrape',
          source,
          ammoType: type,
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
          ammoType: type,
          msg: e.message,
        })
        next(e)
      })
  } catch (e) {
    logger.info({
      type: 'failed-scrape',
      source,
      ammoType: type,
      msg: e.message,
    })
    return next(e)
  }
})

// optional error listeners
worker.on('error', function(err, msg) {
  logger.info({
    type: 'scrape-error',
    message: err && err.message ? err.message : err,
    msg,
  })
})

worker.on('timeout', function(msg) {
  logger.info({ type: 'TIMEOUT-worker', msg })
})

logger.info({ type: 'started-worker' })
