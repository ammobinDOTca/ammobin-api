import { ItemType } from '../graphql-types'
import { SOURCES, QUEUE_NAME, TYPES } from '../constants'
import RedisSMQ from 'rsmq'

async function doWork() {
  const rsmq = new RedisSMQ({ host: 'redis' })

  function queueUpCacheRefresh(type: ItemType) {
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
  await Promise.all(TYPES.map(queueUpCacheRefresh))
  process.exit(0)
}

doWork()
