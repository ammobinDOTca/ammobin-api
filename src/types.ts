import { GQL } from './graphql-types'

export const enum Type {
  rimfire = 'rimfire',
  centerfire = 'centerfire',
  shotgun = 'shotgun',
}

export declare type ScrapeItem = {
  link: string
  img: string
  name: string
  price: number
  vendor: string
  province: string
  calibre: string
}

export declare type ScrapeResponse = ScrapeItem[]
