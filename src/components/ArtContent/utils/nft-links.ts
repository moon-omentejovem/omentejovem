import { Chain } from '../types'

export function getNftLinks(
  value: string,
  nftChain: Chain,
  secondaryValue?: string,
  type?: string
): string {
  switch (nftChain) {
    case 'ethereum':
      let baseUrl = 'https://etherscan.io'

      if (type === 'address') {
        baseUrl += `/address/${value}`
      }

      if (type === 'token') {
        baseUrl += `/token/${value}?a=${secondaryValue}`
      }

      if (type === 'transaction') {
        baseUrl += `/tx/${value}`
      }

      return baseUrl

    default:
      return ''
  }
}
