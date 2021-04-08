import { IVendor, State } from './graphql-types'
declare type Vendor = Omit<Omit<IVendor, '__typename'>, 'background'>

export const BOTACH: Vendor = {
  name: 'Botach',
  link: 'botach.com',
  logo: 'botach-logo.png',
  provinces: [State.NV],
  location: 'Las Vegas',
  hasReloadingItems: false,
}
