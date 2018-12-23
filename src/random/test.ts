// import { bvoutdoors } from '../scrapes/bvoutdoors'
import { gothicLineArmoury } from '../scrapes/gothic-line-armoury'
import * as helpers from '../helpers'
import { Type } from '../types'

const test = async () => {
  const f = await gothicLineArmoury(Type.centerfire)
  console.log(f)
}

test()
