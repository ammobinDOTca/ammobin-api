import * as redis from 'redis'
import * as url from 'url'
import * as helpers from '../helpers'
import { ApolloServer } from 'apollo-server-hapi'
import responseCachePlugin from 'apollo-server-plugin-response-cache'
import { RedisCache } from 'apollo-server-cache-redis'

import { typeDefs, vendors, bestPrices } from './graphql'
import { IItemListing } from '../graphql-types'
import { getItemsFlatListings, getScrapeResponses } from './shared'
import { getRedisItems } from './redis-getter'
import { getApi } from './common-api'
import { getRecordFn } from './types'

const DEV = process.env.DEV === 'true'
const client = redis.createClient({ host: 'redis' })

const getRecordFromRedis: getRecordFn = async (
  itemType,
  subType,
  vendor,
  link
) => {
  const targetUrl = url.parse(link, true)

  let host = targetUrl.hostname ? targetUrl.hostname.replace('www.', '') : ''
  const results: IItemListing[] = await new Promise((resolve, reject) =>
    client.get(helpers.getKey(host, itemType, subType), (err, res) =>
      err ? reject(err) : resolve(JSON.parse(res))
    )
  )

  const record = results.find(r => r && r.link === link)
  return record
}
let server
async function doWork() {
  try {
    server = await getApi(
      {
        routes: { cors: true },
        host: '0.0.0.0',
        port: process.env.PORT || 8080,
      },
      getRecordFromRedis
    )

    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers: {
        Query: {
          vendors,
          bestPrices,
          itemsListings: (_, params) =>
            getScrapeResponses(params, getRedisItems),
          itemsFlatListings: (_, params) =>
            getItemsFlatListings(params, getRedisItems),
        },
      },
      debug: DEV,
      tracing: DEV,
      cache: !DEV
        ? new RedisCache({
            host: 'redis',
          })
        : undefined,
      formatError: error => {
        server.log('error', { type: 'graphql-error', error: error.toString() })
        return error
      },
      plugins: !DEV ? [responseCachePlugin()] : undefined,
      cacheControl: {
        defaultMaxAge: 4 * 60 * 60, // 4hrs in seconds
      },
    })
    await apolloServer.applyMiddleware({
      app: server,
      path: '/api/graphql',
    })

    await apolloServer.installSubscriptionHandlers(server.listener)

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
    _ => process.exit(0),
    _ => process.exit(1)
  )
}
process.on('SIGTERM', shutDown)
// listen on SIGINT signal and gracefully stop the server
process.on('SIGINT', shutDown)
