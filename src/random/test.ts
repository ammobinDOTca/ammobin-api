// import { bvoutdoors } from '../scrapes/bvoutdoors'
import { leverarms } from '../scrapes/leverarms'
import * as helpers from '../helpers'
import { Type } from '../types'

const test = async () => {
  const f = await leverarms(Type.centerfire)
  console.log(f)
}

test()
