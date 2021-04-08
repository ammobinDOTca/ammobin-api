import axios from 'axios'

const version = require('../../package.json').version
const axiosVersion = require('../../node_modules/axios/package.json').version
axios.defaults.headers.common['User-Agent'] = `AmmoBin.ca/${version} (nodejs; Linux x86_64) axios/${axiosVersion}` // be a
axios.defaults.headers.common.Referer = `ammobin.ca`
axios.defaults.timeout = 20000 // 20s request timeout
import { ItemType, IItemListing } from '../graphql-types'
import { makeSearch as ca_makeSearch } from './ca'
import { makeSearch as us_makeSearch } from './us'

export function makeSearch(source: string, type: ItemType, country): Promise<IItemListing[]> {
  if (country === 'US') {
    return us_makeSearch(source, type)
  } else if (country === 'CA') {
    return ca_makeSearch(source, type)
  } else {
    throw new Error('unknown country: ' + country)
  }
}
