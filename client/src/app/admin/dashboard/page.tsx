'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface MintData {
  contractAddress: string
  tokenId: string
  mintDate: string
  imageUrl: string | null
}

const PLATFORM_CONTRACTS = {
  SUPERRARE: '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0',
  POAP: '0x22c1f6050e56d2876009903609a2cc3fef83b415',
  RARIBLE: '0x60f80121c31a0d46b5279700f9df786054aa5ee5'
} as const

const PLATFORM_STYLES = {
  SUPERRARE: 'bg-purple-100 text-purple-800',
  POAP: 'bg-green-100 text-green-800',
  RARIBLE: 'bg-blue-100 text-blue-800'
} as const

export default function AdminDashboard() {
  const router = useRouter()
  const [mintData, setMintData] = useState<MintData[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<keyof MintData>('mintDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchMintData = async () => {
      try {
        const response = await fetch('/mint-dates.json')
        const data = await response.json()
        // Filter out null values and sort by mint date
        const validData = data.filter((item: MintData | null) => item !== null)
        setMintData(validData)
      } catch (error) {
        console.error('Error fetching mint data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMintData()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      })
      router.push('/admin')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleSort = (field: keyof MintData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPlatform = (contractAddress: string) => {
    const address = contractAddress.toLowerCase()
    if (address === PLATFORM_CONTRACTS.SUPERRARE.toLowerCase()) return 'SUPERRARE'
    if (address === PLATFORM_CONTRACTS.POAP.toLowerCase()) return 'POAP'
    if (address === PLATFORM_CONTRACTS.RARIBLE.toLowerCase()) return 'RARIBLE'
    return null
  }

  const filteredAndSortedData = mintData
    .filter(item => 
      item.contractAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tokenId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'mintDate') {
        const dateA = new Date(a.mintDate).getTime()
        const dateB = new Date(b.mintDate).getTime()
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
      }
      
      const aValue = String(a[sortField])
      const bValue = String(b[sortField])
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by contract address or token ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
          />
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('contractAddress')}
                  >
                    Contract Address
                    {sortField === 'contractAddress' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('tokenId')}
                  >
                    Token ID
                    {sortField === 'tokenId' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('mintDate')}
                  >
                    Mint Date
                    {sortField === 'mintDate' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Optimized Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedData.map((item, index) => {
                  const platform = getPlatform(item.contractAddress)
                  return (
                    <tr key={`${item.contractAddress}-${item.tokenId}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        {item.contractAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.tokenId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(item.mintDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.imageUrl ? (
                          <a 
                            href={item.imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Image
                          </a>
                        ) : (
                          <span className="text-gray-400">No optimized image (will use full-res)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {platform && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PLATFORM_STYLES[platform]}`}>
                            {platform}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 