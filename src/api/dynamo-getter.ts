import { IItemListing } from '../graphql-types'

import { DynamoDB } from 'aws-sdk'
const docClient = new DynamoDB.DocumentClient({ region: 'ca-central-1' })

export async function getDyanmoItems(
  vendors: string[],
  keys: string[]
): Promise<IItemListing[]> {
  const docs = await docClient
    .batchGet({
      RequestItems: {
        ammobinItems: {
          ExpressionAttributeNames: vendors.reduce((m, v, i) => {
            m['#' + i] = v
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
        if (doc[v]) {
          _res = _res.concat(doc[v])
        }
      })
      return _res
    },
    []
  )
  if (docs.UnprocessedKeys) {
    console.log('UNPROCESSED KEYS', docs.UnprocessedKeys)
  }

  return results
}
