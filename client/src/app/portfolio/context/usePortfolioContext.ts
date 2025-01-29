import { useContext } from 'react'
import {
  PortfolioContext,
  type PortfolioContextProperties
} from './PortfolioContext'

export function usePortfolioContext(): PortfolioContextProperties {
  const values = useContext(PortfolioContext)

  console.log('!!!values', values)

  if (!values) {
    throw new Error('PortfolioContext should be called inside a provider')
  }

  return values
}
