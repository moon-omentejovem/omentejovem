import { NFT } from '../types'
import { addHours, format } from 'date-fns'

export function getMintedOn(nft: NFT): string {
  if (
    nft.contract.address.toLowerCase() ===
    '0x0000000000000000000000000000000000000000'
  ) {
    return ''
  }

  if (
    nft.contract.address.toLowerCase() ===
      '0x495f947276749ce646f68ac8c248420045cb7b5e' &&
    nft.tokenId ===
      '7871549583317194720263843996823387702908660152655034722079186002726342361098'
  ) {
    return '1 November, 2021'
  }

  return nft.mint.timestamp
    ? format(addHours(nft.mint.timestamp || new Date(), 3), 'd LLLL, yyyy')
    : ''
}
