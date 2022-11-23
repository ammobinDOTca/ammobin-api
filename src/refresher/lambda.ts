/**
 * queues rounds of scrapes every 6 hrs
 */
import { SQS } from '@aws-sdk/client-sqs'
import { ScheduledEvent } from 'aws-lambda'
import { SOURCES, TYPES } from '../constants'
import { logger } from '../logger'
import { ItemType } from '../graphql-types'
import {
  //CANADA_FIRST_AMMO,
  TENDA,
  GREAT_NORTH_PRECISION,
} from '../vendors'

/**
 * {
    "version": "0",
    "id": "53dc4d37-cffa-4f76-80c9-8b7d4a4d2eaa",
    "detail-type": "Scheduled Event",
    "source": "aws.events",
    "account": "123456789012",
    "time": "2015-10-08T16:53:06Z",
    "region": "us-east-1",
    "resources": [
        "arn:aws:events:us-east-1:123456789012:rule/my-scheduled-rule"
    ],
    "detail": {}
}
 */

function getQueueUrl(source: string, type: ItemType): string {
  if (
    [
      // {
      // moved to amp page for a test in april 2021
      //   source: CANADA_FIRST_AMMO.link,
      // },
      {
        source: GREAT_NORTH_PRECISION.link,
      },
      {
        source: TENDA.link,
      },
    ].some((x) => x.source === source)
  ) {
    return process.env.LargeMemoryQueueUrl || 'SHIT'
  }

  return process.env.QueueUrl || 'SHIT'
}

const sqs = new SQS()
export async function handler(e: ScheduledEvent) {
  /**
   * 20200119 most of AWS bill is DynamoDB, and 97% of the cost is due to writes.
   * since most people are only looking at centerfire, reduce refresh rate for others...
   */
  const today = new Date()
  let types: ItemType[]
  if (today.getUTCDay() === 1) {
    types = TYPES
  } else if (today.getUTCDay() % 2 === 0) {
    // wuhan hype
    types = [ItemType.centerfire, ItemType.shotgun]
  } else {
    types = [ItemType.centerfire]
  }

  logger.info({
    type: 'refresh-cache',
    roundType: types.length > 1 ? 'all' : 'centerfire',
  })

  return Promise.all(
    types.reduce(
      (lst, t) =>
        lst.concat(
          SOURCES.map((source) =>
            sqs
              .sendMessage({
                QueueUrl: getQueueUrl(source, t),
                MessageBody: JSON.stringify({ source, type: t }),
              })
          )
        ),
      [] as Promise<any>[]
    )
  )
}
