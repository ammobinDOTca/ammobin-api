import { BOTACH, BROWNELLS } from '../../vendors-us'
import { botach } from './botach'
import { ItemType, IItemListing } from '../../graphql-types'
import { brownells } from './brownells'

export function makeSearch(source: string, type: ItemType): Promise<IItemListing[]> {
  switch (source) {
    case BOTACH.link:
      return botach(type)
    case BROWNELLS.link:
      return brownells(type)
    default:
      throw new Error('unknown source: ' + source)
  }
}
