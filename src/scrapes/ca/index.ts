import { cabelas } from './cabelas-api'
import { canadiantire } from './canadian-tire'
import { wolverinesupplies } from './wolverine-api'
import { theAmmoSource } from './the-ammo-source'
import { hirsch } from './hirschprecision'
import { wildWest } from './wild-west'
import { tigerArms } from './tiger-arms'
import { magdump } from './magdump'
import { rangeviewsports } from './rangeviewsports'
import { jobrook } from './jo-brook'
import { faoc } from './faoc'
import { alflahertys } from './alflahertys'
import { bullseyelondon } from './bullseyelondon'
import { sail } from './sail'
import { reliablegun } from './reliablegun'
import { tenda } from './tenda'
import { canadaammo } from './canadaammo'
import { frontierfirearms } from './frontierfirearms'
import { tradex } from './tradex'
import { bvoutdoors } from './bvoutdoors'
import { nas } from './nas'
import { dante } from './dante'
import { leverarms } from './leverarms'
import { theShootingCenter } from './the-shooting-center'
import { westernMetal } from './western-metal'
import { alSimmons } from './al-simmons'
import { vancouvergunstore } from './vancovergunstore'
import { barton } from './barton'
import { shootingEdge } from './shooting-edge'
import { lanz } from './lanz'
import { durhamoutdoors } from './durhamoutdoors'
import { solelyOutdoors } from './solely-outdoors'
import { northpro } from './northpro'
import { wanstalls } from './wanstalls'
import { gothicLineArmoury } from './gothic-line-armoury'
import { rampart } from './rampart'
import { ItemType, IItemListing } from '../../graphql-types'
import { westCoastHunting } from './westcoasthunting'
import { siwashSports } from './siwash'
import { tillsonburg } from './tillsonburg'
import { crafm } from './crafm'
import { northernEliteFirearms } from './northern-elite-firearms'
import { gunhub } from './gunhub'
import { budgetShooterSupply } from './budget-shooter-supply'
import { rustyWood } from './rusty-wood'
import { theGunDealer } from './the-gun-dealer'
import { waspMunitions } from './wasp-munitions'
import { greatNorthPercision as greatNorthPrecision } from './great-north-precision'
import { tesro } from './tesro'
import { xmetal } from './xmetal'
import { triggerAndBows } from './trigger-and-bows'
import { g4c } from './g4c'
import {
  BACK_COUNTRY_SPORTS,
  SYLVESTRE_SPORTING_GOODS,
  LONDEROS_SPORTS,
  NORDIC_MARKSMAN,
  PROPHET_RIVER,
  MARSTAR,
  NAS,
  BULLS_EYE,
  NICKS_SPORTS,
  CANADA_FIRST_AMMO,
  TENDA,
  GREAT_NORTH_PRECISION,
  VICTORY_RIDGE_SPORTS,
  NECHAKO,
  OLEY,
} from '../../vendors'
import { backcountrysports } from './backcountrysports'
import { sylvertrsportinggoods } from './sylvertrsportinggoods'
import { londerosports } from './londerosports'
import { nordicMarksman } from './nordic-marksman'
import { prophetRiver } from './prophetriver'
import { marstar } from './marstar'
import { nickssportshop } from './nickssportshop'
import { canadaFirstAmmo } from './canada-first-ammo'
import { victoryRidge } from './victory-ridge'
import { nechako } from './nechako'
import { oley } from './oleys-armoury'

export function makeSearch(source: string, type: ItemType): Promise<IItemListing[]|null> {
  switch (source) {
    case VICTORY_RIDGE_SPORTS.link:
      return victoryRidge(type)
    case CANADA_FIRST_AMMO.link:
      return canadaFirstAmmo(type)
    case MARSTAR.link:
      return marstar(type)
    case 'g4cgunstore.com':
      return g4c(type)
    case 'triggersandbows.com':
      return triggerAndBows(type)
    case 'xmetaltargets.com':
      return xmetal(type)
    case 'tesro.ca':
      return tesro(type)
    case GREAT_NORTH_PRECISION.link:
      return greatNorthPrecision(type)
    case 'waspmunitions.ca':
      return waspMunitions(type)
    case 'thegundealer.net':
      return theGunDealer(type)
    case 'rustywood.ca':
      return rustyWood(type)
    case 'budgetshootersupply.ca':
      return budgetShooterSupply(type)
    case 'gun-hub.mybigcommerce.com':
      return gunhub(type)

    case 'cabelas.ca':
      return cabelas(type)

    case 'firearmsoutletcanada.com':
      return faoc(type)

    case 'alflahertys.com':
      return alflahertys(type)

    case BULLS_EYE.link:
      return bullseyelondon(type)

    case 'sail.ca':
      return sail(type)

    case 'reliablegun.com':
      return reliablegun(type)

    case 'canadiantire.ca':
      return canadiantire(type)

    case TENDA.link:
      return tenda(type)

    case 'canadaammo.com':
      return canadaammo(type)

    case 'jobrookoutdoors.com':
      return jobrook(type)

    case 'theammosource.com':
      return theAmmoSource(type)

    case 'hirschprecision.com':
      return hirsch(type)

    case 'gun-shop.ca':
      return wildWest(type)

    case 'tigerarms.ca':
      return tigerArms(type)

    case 'magdump.ca':
      return magdump(type)

    case 'rangeviewcanada.com':
    case 'rangeviewsports.ca':
      return rangeviewsports(type)

    case 'wolverinesupplies.com':
      return wolverinesupplies(type)

    case 'frontierfirearms.ca':
      return frontierfirearms(type)

    case 'tradeexcanada.com':
      return tradex(type)

    case 'bvoutdoors.com':
      return bvoutdoors(type)

    case NAS.link:
      return nas(type)

    case 'dantesports.com':
      return dante(type)

    case 'leverarms.com':
      return leverarms(type)

    case 'store.theshootingcentre.com':
      return theShootingCenter(type)

    case 'westernmetal.ca':
      return westernMetal(type)

    case 'alsimmonsgunshop.com':
      return alSimmons(type)

    case 'vancouvergunstore.ca':
      return vancouvergunstore(type)

    case 'bartonsbigcountry.ca':
      return barton(type)

    case 'theshootingedge.com':
      return shootingEdge(type)

    case 'lanzshootingsupplies.com':
      return lanz(type)

    case 'durhamoutdoors.ca':
      return durhamoutdoors(type)

    case 'solelyoutdoors.com':
      return solelyOutdoors(type)

    case 'northprosports.com':
      return northpro(type)

    case 'wanstallsonline.com':
      return wanstalls(type)

    case 'gothiclinearmoury.ca':
      return gothicLineArmoury(type)

    case 'rampartcorp.com':
      return rampart(type)
    case 'westcoasthunting.ca':
      return westCoastHunting(type)
    case 'siwashsports.ca':
      return siwashSports(type)
    case 'tillsonburggunshop.com':
      return tillsonburg(type)
    case 'crafm.com':
      return crafm(type)
    case 'northernelitefirearms.ca':
      return northernEliteFirearms(type)
    case BACK_COUNTRY_SPORTS.link:
      return backcountrysports(type)

    case SYLVESTRE_SPORTING_GOODS.link:
      return sylvertrsportinggoods(type)

    case LONDEROS_SPORTS.link:
      return londerosports(type)
    case NORDIC_MARKSMAN.link:
      return nordicMarksman(type)
    case PROPHET_RIVER.link:
      return prophetRiver(type)
    case NICKS_SPORTS.link:
      return nickssportshop(type)
    case NECHAKO.link:
      return nechako(type)
    case OLEY.link:
      return oley(type)
    default:
      throw new Error(`unknown source: ${source} + type: ${type}`)
  }
}
