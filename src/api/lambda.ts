// used to encrypt request ip
import { transformRequest, transformResponse } from 'hapi-lambda'
import { APIGatewayEvent } from 'aws-lambda'

// import { DynamoDB } from 'aws-sdk'
// import { IItemListing } from '../graphql-types'
import { getApi } from './common-api'

// const docClient = new DynamoDB.DocumentClient({ region: 'ca-central-1' }) // todo: this should be a param

export async function init() {
  // const getRecordFn = async (itemType, subType, vendor, link) => {
  //   const docs = await docClient
  //     .batchGet({
  //       RequestItems: {
  //         ammobinItems: {
  //           ExpressionAttributeNames: {
  //             '#1': vendor.name,
  //           },
  //           ProjectionExpression: '#1',
  //           Keys: [{ id: `${itemType}_${subType}` }],
  //         },
  //       },
  //     })
  //     .promise()

  //   let record: IItemListing
  //   if (
  //     !docs.Responses[`ammobinItems`] ||
  //     !docs.Responses[`ammobinItems`][0] ||
  //     !docs.Responses[`ammobinItems`][0][vendor.name]
  //   ) {
  //     console.warn('no dynamodb record found')
  //   } else {
  //     record = docs.Responses[`ammobinItems`][0][vendor.name].filter(
  //       (r: IItemListing) => r.link === link
  //     )[0]
  //   }
  //   return record
  // }

  return await getApi({} /*, getRecordFn*/)
}

// TODO: remove hapi part, and convert to pure function with shared code with normal server?

let _server // cached server instance

export async function handler(event: APIGatewayEvent) {
  if (!_server) {
    _server = await init()
  }

  const request = transformRequest(event)

  // handle cors here if needed
  request.headers['Access-Control-Allow-Origin'] = '*'

  const response = await _server.inject(request)

  return transformResponse(response)
}
