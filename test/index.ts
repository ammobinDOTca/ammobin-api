import { handler as graphqlTest } from './graphql'
import { handler as imagesTest } from './images'
import { handler as apiTest } from './api'

/**
 * run all of our integ tests...
 * @param param0 {base: baseUrl}
 */
export async function handler(event) {
  console.log(event)
  const { base } = event

  await apiTest({ base })

  await graphqlTest({ base })

  await imagesTest({ base })

  return true
}
