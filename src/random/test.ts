import { makeSearch } from '../scrapes'

async function work() {
  // tslint:disable: no-console
  console.time('makeSearch')
  try {
    const f = await makeSearch(
      process.env.URL || 'siwashsports.ca',
      process.env.TYPE || ('shotgun' as any)
    )
    console.log(f)
  } catch (e) {
    console.error(e.request, e.code, e.message)
  }
  console.timeEnd('makeSearch')
}

work()
