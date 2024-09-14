import { NftArt } from "../types"

export function getNftLinks(
  value: string,
  nftChain: NftArt['nftChain'],
  secondaryValue?: string,
  type?: string
): string {
  switch (nftChain) {
    case 'Unknown':
    case 'Ethereum':
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

    case 'Tezos':
      if (type === 'token') {
        return `https://tzkt.io/${value}/tokens/${secondaryValue}/transfers`
      }

      return `https://tzkt.io/${value}`

    default:
      return ''
  }
}
