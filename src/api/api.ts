import { ApolloServer } from 'apollo-server-hapi'
import responseCachePlugin from 'apollo-server-plugin-response-cache'
import { RedisCache } from 'apollo-server-cache-redis'

import { typeDefs, vendors, bestPrices } from './graphql'
import {  getItemsFlatListings, getScrapeResponses } from './shared'
import { getRedisItems } from './redis-getter'
import { getApi } from './common-api'
import { getDyanmoItems } from './dynamo-getter'
// import { getRecordFn } from './types'

const DEV = process.env.DEV === 'true'
const REDIS_URL = process.env.REDIS_URL
// const client = redis.createClient({ host: 'redis' })

// const getRecordFromRedis: getRecordFn = async (itemType, subType, vendor, link) => {
//   const targetUrl = url.parse(link, true)

//   let host = targetUrl.hostname ? targetUrl.hostname.replace('www.', '') : ''
//   const results: IItemListing[] = await new Promise((resolve, reject) =>
//     client.get(helpers.getKey(host, itemType, subType), (err, res) => (err ? reject(err) : resolve(JSON.parse(res))))
//   )

//   const record = results.find(r => r && r.link === link)
//   return record
// }
let server
async function doWork() {
  try {
    server = await getApi(
      {
        routes: { cors: true },
        host: '0.0.0.0',
        port: process.env.PORT || 8080,
      }
      // getRecordFromRedis
    )

    // todo: imp redis getter + enable redis getter IFF REDIS_URL
    const getter = process.env.REDIS_URL ? getRedisItems : getDyanmoItems
    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers: {
        Query: {
          vendors,
          bestPrices,
          itemsListings: (_, params) => getScrapeResponses(params, getter),
          itemsFlatListings: (_, params) => getItemsFlatListings(params, getter),
        },
      },
      debug: DEV,
      //tracing: DEV,
      cache:
        !DEV && REDIS_URL
          ? new RedisCache({
              host: REDIS_URL,
            })
          : undefined,
      formatError: (error) => {
        server.log('error', { type: 'graphql-error', error: error.toString() })
        return error
      },
      plugins: (!DEV ? [responseCachePlugin()] : undefined) as any,
      // cacheControl: {
      //   defaultMaxAge: DEV ? 0 : get24HourCacheRefreshExpiry(),
      // },
    })
    await apolloServer.applyMiddleware({
      app: server,
      path: '/api/graphql',
    })

   // await apolloServer.installSubscriptionHandlers(server.listener) // todo restore

    await server.start()
    server.log('info', { type: 'server-started', uri: server.info.uri })
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

doWork()
function shutDown() {
  server.log('info', { type: 'server-stopped', uri: server.info.uri })
  server.stop({ timeout: 10000 }).then(
    (_) => process.exit(0),
    (_) => process.exit(1)
  )
}
process.on('SIGTERM', shutDown)
// listen on SIGINT signal and gracefully stop the server
process.on('SIGINT', shutDown)
