import { makeSearch } from '../scrapes'

async function work() {
  // tslint:disable: no-console
  console.time('makeSearch')
  try {
    const f = await makeSearch(
      process.env.URL || 'siwashsports.ca',
      process.env.TYPE || ('shotgun' as any),
      process.env.COUNTRY || 'CA'
    )
    console.log(f, f!.length)
  } catch (e:any) {
    console.error('Failed', e.request, e.code, e.message)
  }
  console.timeEnd('makeSearch')
}

work().catch((e) => console.error('aaa', e))
