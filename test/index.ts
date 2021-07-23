import { handler as graphqlTest } from './graphql'
import { handler as imagesTest } from './images'
import { handler as apiTest } from './api'
import { handler as nuxtTest } from './nuxt'

import { logger } from '../src/logger'

/**
 * run all of our integ tests...
 * @param param0 {base: baseUrl}
 */
export async function handler(event) {
  logger.info({
    type: 'test-run-started',
    event,
  })
  const { base } = event
  try {
    await nuxtTest({ base })
    await apiTest({ base })

    await graphqlTest({ base })

    await imagesTest({ base })

    logger.info({
      type: 'test-run-passed',
      event,
    })

    return true
  } catch (e) {
    logger.info({
      type: 'test-run-failed',
      event,
      error: e.toString(),
    })
    throw e
  }
}
