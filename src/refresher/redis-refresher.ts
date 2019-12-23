/**
 * queues rounds of scrapes every 6 hrs
 */

import cron = require('node-cron')
import RedisSMQ from 'rsmq'

import { SOURCES, CACHE_REFRESH_HOURS, QUEUE_NAME, TYPES } from '../constants'
import { logger } from '../logger'

const rsmq = new RedisSMQ({ host: 'redis' })

function queueUpCacheRefresh(type) {
  return Promise.all(
    SOURCES.map(
      source =>
        new Promise((resolve, reject) =>
          rsmq.sendMessage(
            { qname: QUEUE_NAME, message: JSON.stringify({ source, type }) },
            (err, res) => (err ? reject(err) : resolve(res))
          )
        )
    )
  )
}

rsmq.listQueues((err, queues) => {
  if (err) {
    logger.error({ type: 'failed-to-list-rsmq-queues', error: err.toString() })
    throw err
  }
  if (queues.indexOf(QUEUE_NAME) === -1) {
    rsmq.createQueue({ qname: QUEUE_NAME }, (err2, resp) => {
      if (err2) {
        logger.error({
          type: 'failed-to-create-rsmq-queues',
          error: err2.toString(),
        })
        throw err
      }
      if (resp === 1) {
        logger.info({ type: 'rsmq-queue-created' })
      }
    })
  }
})

TYPES.map((t, index) =>
  cron.schedule(
    `0 ${index} */${CACHE_REFRESH_HOURS} * * *`,
    async () => {
      logger.info({
        type: 'refresh-cache',
        roundType: t,
      })

      await queueUpCacheRefresh(t)

      logger.info({ type: 'cache-refresh-initd', group: t })
    },
    {
      scheduled: true,
      timezone: 'America/Los_Angeles',
    }
  )
)
