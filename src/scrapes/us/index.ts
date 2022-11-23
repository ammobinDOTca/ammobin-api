import {
  BOTACH,
  BROWNELLS,
  GORILLA,
  GUNMAG,
  NATCHEZ,
  OPTICS_PLANET,
  PALMETTO,
  RAINER,
  SPORTSMAN,
  FOUNDRY,
  GREEN_COUNTRY,
  IMPACT,
  LUCKY,
} from '../../vendors-us'
import { botach } from './botach'
import { ItemType, IItemListing } from '../../graphql-types'
import { brownells } from './brownells'
import { gorilla } from './gorilla'
import { gunmag } from './gunmag'
import { natchez } from './natchezss'
import { sportsman } from './sportsman'
import { rainer } from './rainier'
import { OpticsPlanet as opticsPlanet } from './optics-planet'
import { palmetto } from './palmetto'
import { foundry } from './foundry'
import { greenCountry } from './green-country'
import { impact } from './impact'
import { lucky } from './lucky'

export function makeSearch(source: string, type: ItemType): Promise<IItemListing[]|null> {
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
    case OPTICS_PLANET.link:
      return opticsPlanet(type)
    case PALMETTO.link:
      return palmetto(type)
    case RAINER.link:
      return rainer(type)
    case SPORTSMAN.link:
      return sportsman(type) // not doing online orders currently as of april 2021....
    case FOUNDRY.link:
      return foundry(type)
    case GREEN_COUNTRY.link:
      return greenCountry(type)
    case IMPACT.link:
      return impact(type)
    case LUCKY.link:
      return lucky(type)
    default:
      throw new Error('unknown source: ' + source)
  }
}
