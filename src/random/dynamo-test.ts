import { getDyanmoItems } from '../api/dynamo-getter'
// import { ItemType } from "../graphql-types";
// import { VENDORS } from "../constants";
import { getItemsFlatListings } from '../api/shared'
import { ItemType } from '../graphql-types'

async function foo() {
  const result = await getItemsFlatListings(
    {
      itemType: ItemType.centerfire,
      subType: '.22-250 REMINGTON',
    },
    getDyanmoItems
  )
  // const result = await getDyanmoItems([ItemType.centerfire], ['.22-250 REMINGTON'], VENDORS.map(v => v.name))
  console.log(result)
}

foo()
