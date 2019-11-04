import * as redis from 'redis'
import { IItemListing, ItemType } from '../graphql-types'
import { getKey } from '../helpers'
const client = redis.createClient({ host: 'redis' })

export async function getRedisItems(
  types: ItemType[],
  subTypes: string[],
  vendors: string[]
): Promise<IItemListing[]> {
  const keys: string[] = types
    .map(t => vendors.map(s => subTypes.map(st => getKey(s, t, st))))
    .flat<string>(Infinity)

  const results: IItemListing[][] = await new Promise((resolve, reject) =>
    client.mget(keys, (err, rres: string[]) =>
      err ? reject(err) : resolve(rres.map(r => (r ? JSON.parse(r) : null)))
    )
  )
  return results.reduce((final, r) => (r ? final.concat(r) : final), [])
}
