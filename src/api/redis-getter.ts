import * as redis from 'redis'
import { IItemListing } from '../graphql-types'

const client = redis.createClient({ host: 'redis' })

export async function getRedisItems(keys: string[]): Promise<IItemListing[]> {
  const results: IItemListing[][] = await new Promise((resolve, reject) =>
    client.mget(keys, (err, rres: string[]) =>
      err ? reject(err) : resolve(rres.map(r => (r ? JSON.parse(r) : null)))
    )
  )
  return results.reduce((final, r) => (r ? final.concat(r) : final), [])
}
