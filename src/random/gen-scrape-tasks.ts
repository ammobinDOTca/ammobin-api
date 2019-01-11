import { AmmoType } from '../graphql-types'
import { SOURCES, QUEUE_NAME } from '../constants'
import RedisSMQ from 'rsmq'

async function doWork() {
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
  await queueUpCacheRefresh(AmmoType.rimfire)
  process.exit(0)
}

doWork()
