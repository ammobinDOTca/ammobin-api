import { IItemListing, ItemType, IVendor } from '../graphql-types'

import { DynamoDB } from 'aws-sdk'
const docClient = new DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'ca-central-1',
})

export async function getDyanmoItems(
  types: ItemType[],
  subTypes: string[],
  vendors: IVendor[]
): Promise<IItemListing[]> {
  const keys: string[] = types.reduce(
    (ll, type) =>
      ll.concat(
        subTypes.reduce(
          (lll, _subType) => lll.concat(`${type}_${_subType}`),
          [] as string[]
        )
      ),
    [] as string[]
  )

  const docs = await docClient
    .batchGet({
      RequestItems: {
        ammobinItems: {
          ExpressionAttributeNames: vendors.reduce((m, v, i) => {
            m['#' + i] = v.name
            return m
          }, {}),
          ProjectionExpression: vendors.map((_, i) => '#' + i).join(','),
          Keys: keys.map(k => ({
            id: k, // lol. thanks API DOCS...
          })),
        },
      },
    })
    .promise()

  const results = docs.Responses[`ammobinItems`].reduce<IItemListing[]>(
    (_res, doc) => {
      vendors.forEach(v => {
        if (doc[v.name]) {
          _res = _res.concat(doc[v.name])
        }
      })
      return _res
    },
    []
  )
  if (docs.UnprocessedKeys && Object.keys(docs.UnprocessedKeys).length > 0) {
    console.log('UNPROCESSED KEYS', docs.UnprocessedKeys)
  }

  return results
}
