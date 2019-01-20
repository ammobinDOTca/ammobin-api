import { makeSearch } from '../scrapes'

async function work() {
  await makeSearch('alflahertys.com', 'shotgun' as any)
    .then(f => console.log(f))
    .catch(e => console.error(e))
}

work()
