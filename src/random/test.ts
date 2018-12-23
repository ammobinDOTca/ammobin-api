//import { bvoutdoors } from '../scrapes/bvoutdoors'
import { gothicLineArmoury } from '../scrapes/gothic-line-armoury'
import * as helpers from '../helpers'
console.log(helpers)
import { Type } from '../types'
//console.log(Type)

const test = async () => {
  const f = await gothicLineArmoury(Type.centerfire)
  console.log(f)
}

test()
