import { makeSearch } from '../scrapes'

async function work() {
  await makeSearch(
    'westcoasthunting.ca',
    process.env.TYPE || ('shotgun' as any)
  )
    .then(f => console.log(f))
    .catch(e => console.error(e))
}

work()
