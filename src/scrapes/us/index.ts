import { BOTACH, BROWNELLS, GORILLA, GUNMAG, NATCHEZ } from '../../vendors-us'
import { botach } from './botach'
import { ItemType, IItemListing } from '../../graphql-types'
import { brownells } from './brownells'
import { gorilla } from './gorilla'
import { gunmag } from './gunmag'
import { natchez } from './natchezss'

export function makeSearch(source: string, type: ItemType): Promise<IItemListing[]> {
  switch (source) {
    case BOTACH.link:
      return botach(type)
    case BROWNELLS.link:
      return brownells(type)
    case GORILLA.link:
      return gorilla(type)
    case GUNMAG.link:
      return gunmag(type)
    case NATCHEZ.link:
      return natchez(type)
    default:
      throw new Error('unknown source: ' + source)
  }
}
