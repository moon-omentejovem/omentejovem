import { getApiKeys } from './requests/wordpress/getApiKeys'

interface ApiKeys {
	OpenSea: string
	Email: string
}

export class NftClient {
	private static instance: NftClient

	public readonly openSeaApi: RequestInit & { baseURL: string }

	public static email: string

	constructor(private readonly apiKeys: ApiKeys) {
		this.openSeaApi = {
			baseURL: 'https://api.opensea.io/api/v2',
			headers: {
				'x-api-key': this.apiKeys.OpenSea,
			},
		}

		NftClient.email = apiKeys.Email
	}

	static async getInstance(): Promise<NftClient> {
		if (!this.instance) {
			const apiKeys = await getApiKeys()

			let parsedKeys: ApiKeys = {
				OpenSea: '',
				Email: '',
			}

			for (const apiKey of apiKeys.data) {
				parsedKeys = {
					...parsedKeys,
					[apiKey.title.rendered]: apiKey.acf.key,
				}
			}

			NftClient.instance = new NftClient(parsedKeys)
		}

		return NftClient.instance
	}
}
