/**
 * queues rounds of scrapes every 6 hrs
 */
import { SQS } from 'aws-sdk'
import { ScheduledEvent } from 'aws-lambda'
import { SOURCES, TYPES } from '../constants'
import { workerLogger as logger } from '../logger'
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

const sqs = new SQS()
export async function handler(e: ScheduledEvent) {
  const { type } = e.detail // something
  logger.info({
    type: 'refresh-cache',
    roundType: type,
  })
  return Promise.all(
    (type ? [type] : TYPES)
      .map(t =>
        SOURCES.map(source =>
          sqs
            .sendMessage({
              QueueUrl: process.env.QueueUrl || 'SHIT',
              MessageBody: JSON.stringify({ source, type: t }),
            })
            .promise()
        )
      )
      .flat(1)
  )
}
