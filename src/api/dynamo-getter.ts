import { IItemListing, ItemType, IVendor } from '../graphql-types'
import * as zlib from 'zlib'

import  {DynamoDBClient} from '@aws-sdk/client-dynamodb'
import  {BatchGetCommand, DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb'

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

export async function getDyanmoItems(
  types: ItemType[],
  subTypes: string[],
  vendors: IVendor[]
): Promise<IItemListing[]> {
  const keys: string[] = types.reduce(
    (ll, type) => ll.concat(subTypes.reduce((lll, _subType) => lll.concat(`${type}_${_subType}`), [] as string[])),
    [] as string[]
  )

  const docs = await docClient.send(new BatchGetCommand({
    RequestItems: {
      ammobinItems: {
        ExpressionAttributeNames: vendors.reduce((m, v, i) => {
          m['#' + i] = v.name
          return m
        }, {}),
        ProjectionExpression: vendors.map((_, i) => '#' + i).join(','),
        Keys: keys.map((k) => ({
          id: k, // lol. thanks API DOCS...
        })),
      },
    },
  }))

  const results = docs.Responses![`ammobinItems`].reduce<IItemListing[]>((_res, doc) => {
    vendors.forEach((v) => {
      if (doc[v.name]) {
        let vals
        try {
          vals = JSON.parse(zlib.gunzipSync(Buffer.from(doc[v.name], 'base64')).toString())
        } catch (e) {
          vals = doc[v.name]
        }
        _res = _res.concat(vals)
      }
    })
    return _res
  }, [])
  if (docs.UnprocessedKeys && Object.keys(docs.UnprocessedKeys).length > 0) {
    console.log('UNPROCESSED KEYS', docs.UnprocessedKeys)
  }

  return results
}
