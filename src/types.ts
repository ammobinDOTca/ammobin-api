/// <reference path="graphql-types.ts" />

export const enum Type {
  rimfire = 'rimfire',
  centerfire = 'centerfire',
  shotgun = 'shotgun',
}

declare type shit = GQL.IAmmoListing // todo: extend
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
