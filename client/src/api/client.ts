const apiKey =
  process.env.SIMPLEHASH_API_KEY ||
  'yungwkndllc_sk_2ortb02wp7sp0364r9uf1b88m3p8qr8p'
const baseUrl =
  process.env.API_BASE_URL || 'https://api.simplehash.com/api/v0/nfts/assets'

export const api = {
  baseURL: baseUrl,
  apiKey: apiKey
}
