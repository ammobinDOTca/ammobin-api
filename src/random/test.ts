import { makeSearch } from '../scrapes'
import { AxiosError } from 'axios'
async function work() {
  await makeSearch(
    process.env.URL || 'siwashsports.ca',
    process.env.TYPE || ('shotgun' as any)
  )
    .then(f => console.log(f))
    .catch((e: AxiosError) => console.error(e.request, e.code, e.message))
}

work()
