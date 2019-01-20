import { makeSearch } from '../scrapes'

async function work() {
  await makeSearch('rangeviewcanada.com', 'centerfire' as any)
    .then(f => console.log(f))
    .catch(e => console.error(e))
}

work()
