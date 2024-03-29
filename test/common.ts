const version = require('../package.json').version
const axiosVersion = require('../node_modules/axios/package.json').version

export const USER_AGENT = `AmmoBin.ca/${version}/integ-tests (nodejs; Linux x86_64) axios/${axiosVersion}`

export const assert = (condition: boolean, msg: string) => {
  if (!condition) {
    throw new Error('test assert failed: ' + msg)
  }
}
