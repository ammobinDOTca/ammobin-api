// import * as redis from 'redis'
import { IItemListing, ItemType, IVendor } from '../graphql-types'
// import { getKey } from '../helpers'
// const client = redis.createClient({ host: 'redis' })

export async function getRedisItems(
  types: ItemType[],
  subTypes: string[],
  vendors: IVendor[]
): Promise<IItemListing[]> {
  // const keys: string[] = types
  //   .map(t => vendors.map(s => subTypes.map(st => getKey(s.link, t, st))))
  //   .flat<string>(Infinity)
  // const results: IItemListing[][] = await new Promise((resolve, reject) =>
  //   client.mget(keys, (err, rres: string[]) =>
  //     err ? reject(err) : resolve(rres.map(r => (r ? JSON.parse(r) : null)))
  //   )
  // )
  // return results.reduce((final, r) => (r ? final.concat(r) : final), [])
  return await []
}
