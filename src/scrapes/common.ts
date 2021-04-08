import axios from 'axios'

import cheerio from 'cheerio'
import * as helpers from '../helpers'
import { IItemListing, Region } from '../graphql-types'
import { RENDERTRON_URL } from '../constants'
import chromium from 'chrome-aws-lambda'
import { URL } from 'url'

export interface Selectors {
  item: string
  outOfStock?: string
  name: string
  img: string
  link: string
  price: string
  nextPage?: string
  salePrice?: string
}

export interface Info {
  link: string
  name: string
  provinces: Region[]
}

function correctUrl(baseUrl: string, url: string): string {
  // note: assuming everyone is on https b/c its 2019
  if (!url || !baseUrl) {
    return null
  } else if (url.startsWith('//')) {
    return 'https:' + url
  } else if (url.startsWith('/')) {
    return 'https://' + baseUrl + url
  } else if (!url.startsWith('http')) {
    // some people use relative urls....
    return 'https://' + baseUrl + '/' + url
  }

  return url
}

async function getPage(url: string) {
  // only do internal chrome stuff on lambda (since it is loaded on the layer)
  if (process.env.AWS_EXECUTION_ENV && url.startsWith(RENDERTRON_URL)) {
    // remove rendertron part...
    // todo: cleaner alternative should be considered in the future
    url = url.replace(RENDERTRON_URL + '/render/', '')

    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    })

    // taken from https://github.com/GoogleChrome/rendertron/blob/master/src/renderer.ts
    /**
     * Executed on the page after the page has loaded. Strips script and
     * import tags to prevent further loading of resources.
     */
    function stripPage() {
      // Strip only script tags that contain JavaScript (either no type attribute or one that contains "javascript")
      const elements = document.querySelectorAll('script:not([type]), script[type*="javascript"], link[rel=import]')
      for (const e of Array.from(elements)) {
        e.remove()
      }
    }

    /**
     * Injects a <base> tag which allows other resources to load. This
     * has no effect on serialised output, but allows it to verify render
     * quality.
     */
    function injectBaseHref(origin: string) {
      const base = document.createElement('base')
      base.setAttribute('href', origin)

      const bases = document.head.querySelectorAll('base')
      if (bases.length) {
        // Patch existing <base> if it is relative.
        const existingBase = bases[0].getAttribute('href') || ''
        if (existingBase.startsWith('/')) {
          bases[0].setAttribute('href', origin + existingBase)
        }
      } else {
        // Only inject <base> if it doesn't already exist.
        document.head.insertAdjacentElement('afterbegin', base)
      }
    }

    const page = await browser.newPage()
    const UA = await browser.userAgent()

    await Promise.all([
      // try to tell site about use
      page.setUserAgent(UA + ' ammobin.ca-1.0'),
      page.setExtraHTTPHeaders({ Referrer: 'ammobin.ca' }),
      // Page may reload when setting isMobile
      // https://github.com/GoogleChrome/puppeteer/blob/v1.10.0/docs/api.md#pagesetviewportviewport
      page.setViewport({
        width: 1024,
        height: 640,
      }),
    ])

    page.evaluateOnNewDocument('customElements.forcePolyfill = true')
    page.evaluateOnNewDocument('ShadyDOM = {force: true}')
    page.evaluateOnNewDocument('ShadyCSS = {shimcssproperties: true}')

    let response = null
    // Capture main frame response. This is used in the case that rendering
    // times out, which results in puppeteer throwing an error. This allows us
    // to return a partial response for what was able to be rendered in that
    // time frame.
    page.addListener('response', (r) => {
      if (!response) {
        response = r
      }
    })

    try {
      // Navigate to page. Wait until there are no oustanding network requests.
      response = await page.goto(url, {
        timeout: 30000 /*30 seconds*/,
        waitUntil: 'networkidle0',
      })
    } catch (e) {
      console.error(e)
    }

    if (!response) {
      console.error('response does not exist')
      // This should only occur when the page is about:blank. See
      // https://github.com/GoogleChrome/puppeteer/blob/v1.5.0/docs/api.md#pagegotourl-options.
      await page.close()
      throw 'response does not exist'
    }

    // Set status to the initial server's response code. Check for a <meta
    // name="render:status_code" content="4xx" /> tag which overrides the status
    // code.
    let statusCode = response.status()
    const newStatusCode = await page
      .$eval('meta[name="render:status_code"]', (element) => parseInt(element.getAttribute('content') || '', 10))
      .catch(() => undefined)
    // On a repeat visit to the same origin, browser cache is enabled, so we may
    // encounter a 304 Not Modified. Instead we'll treat this as a 200 OK.
    if (statusCode === 304) {
      statusCode = 200
    }
    // Original status codes which aren't 200 always return with that status
    // code, regardless of meta tags.
    if (statusCode === 200 && newStatusCode) {
      statusCode = newStatusCode
    }

    // Remove script & import tags.
    await page.evaluate(stripPage)
    // Inject <base> tag with the origin of the request (ie. no path).
    const parsedUrl = new URL(url)
    await page.evaluate(injectBaseHref, `${parsedUrl.protocol}//${parsedUrl.host}`)

    // Serialize page.
    const result = await page.evaluate('document.firstElementChild.outerHTML')

    await page.close()
    return { data: result }
  } else {
    return axios.get(url).catch((e) => {
      throw new Error(`scrape failed http${e?.response?.status || 'unknown'} for ${url}`)
    })
  }
}

export async function scrape(
  getUrl: (page: number) => string,
  info: Info,
  selectors: Selectors,
  page = 1
): Promise<IItemListing[]> {
  await helpers.delayScrape(info.link)
  console.log(getUrl(page))
  const r = await getPage(getUrl(page))
  let $ = cheerio.load(r.data)
  const items = []
  $(selectors.item).each((index, row) => {
    const result = {} as IItemListing
    const tha = $(row)

    if (selectors.outOfStock && tha.find(selectors.outOfStock).length > 0) {
      return
    }
    result.link = correctUrl(info.link, tha.find(selectors.link).prop('href'))
    result.img = correctUrl(info.link, tha.find(selectors.img).prop('src'))

    result.name = tha.find(selectors.name).text().trim()
    const priceTxt = tha.find(selectors.price).last().text() // sale price come last...
    console.log('priceTxt', priceTxt)
    result.price = parseFloat(priceTxt.replace(/[^\d\.]*/g, ''))

    result.vendor = info.name
    result.provinces = info.provinces

    items.push(result)
  })

  if (selectors.nextPage && $(selectors.nextPage).length > 0 && items.length > 0) {
    $ = null // dont hold onto page for recursion
    const more = await scrape(getUrl, info, selectors, page + 1)
    return items.concat(more)
  } else {
    return items
  }
}
