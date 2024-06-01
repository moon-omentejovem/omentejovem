import { useContext } from 'react'
import { OneOfOneContext, type OneOfOneContextProperties } from './OneOfOneContext'

export function useOneOfOneContext(): OneOfOneContextProperties {
	const values = useContext(OneOfOneContext)

	if (!values) {
		throw new Error('OneOfOneContext should be called inside a provider')
	}

	return values
}
